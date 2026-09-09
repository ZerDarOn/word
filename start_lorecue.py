"""Start the LoreCue front-end prototype and open it in the default browser."""

from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parent
LOCAL_URL = "http://localhost:3000/"
HEALTHCHECK_URL = LOCAL_URL
START_TIMEOUT_SECONDS = 45
CODEX_RUNTIME_ROOT = (
    Path.home()
    / ".cache"
    / "codex-runtimes"
    / "codex-primary-runtime"
    / "dependencies"
)


def page_is_lorecue() -> bool:
    try:
        direct_opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with direct_opener.open(HEALTHCHECK_URL, timeout=10) as response:
            html = response.read(200_000).decode("utf-8", errors="ignore")
            return response.status == 200 and "LoreCue" in html and "主持人咨询台" in html
    except (OSError, urllib.error.URLError):
        return False


def port_is_in_use() -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as connection:
        connection.settimeout(1)
        return connection.connect_ex(("127.0.0.1", 3000)) == 0


def find_pnpm() -> Path:
    command = shutil.which("pnpm.cmd") or shutil.which("pnpm")
    if command:
        return Path(command)

    bundled = CODEX_RUNTIME_ROOT / "bin" / "fallback" / "pnpm.cmd"
    if bundled.exists():
        return bundled

    raise RuntimeError(
        "没有找到 pnpm。请先安装 Node.js 22 和 pnpm，或从 Codex 工作区中运行本脚本。"
    )


def prepare_environment() -> dict[str, str]:
    environment = os.environ.copy()
    bundled_node_dir = CODEX_RUNTIME_ROOT / "node" / "bin"
    bundled_bin_dir = CODEX_RUNTIME_ROOT / "bin" / "fallback"
    extra_paths = [path for path in (bundled_node_dir, bundled_bin_dir) if path.exists()]
    if extra_paths:
        environment["PATH"] = os.pathsep.join(
            [*(str(path) for path in extra_paths), environment.get("PATH", "")]
        )
    environment["WRANGLER_LOG_PATH"] = ".wrangler/wrangler.log"
    return environment


def pnpm_command(pnpm: Path, *arguments: str) -> list[str]:
    if os.name == "nt" and pnpm.suffix.lower() == ".cmd":
        command_text = f'""{pnpm}" {" ".join(arguments)}"'
        return [os.environ.get("COMSPEC", "cmd.exe"), "/d", "/s", "/c", command_text]
    return [str(pnpm), *arguments]


def install_dependencies(pnpm: Path, environment: dict[str, str]) -> None:
    if (PROJECT_DIR / "node_modules").exists():
        return
    print("首次启动：正在准备前端依赖，请稍候……")
    subprocess.run(
        pnpm_command(pnpm, "install"),
        cwd=PROJECT_DIR,
        env=environment,
        check=True,
    )


def wait_until_ready(process: subprocess.Popen[bytes]) -> None:
    deadline = time.monotonic() + START_TIMEOUT_SECONDS
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError("LoreCue 启动进程提前退出，请查看上方提示。")
        if page_is_lorecue():
            return
        time.sleep(0.5)
    raise TimeoutError("LoreCue 在 45 秒内没有完成启动。")


def terminate_process_tree(process: subprocess.Popen[bytes]) -> None:
    """Stop the launcher and every development-server process it created."""
    if process.poll() is not None:
        return

    print(f"正在停止 LoreCue 进程树（启动进程 {process.pid}）……")
    if os.name == "nt":
        result = subprocess.run(
            ["taskkill", "/PID", str(process.pid), "/T", "/F"],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode not in (0, 128):
            message = result.stderr.strip() or result.stdout.strip()
            print(f"停止命令返回异常：{message}", file=sys.stderr)
    else:
        process.terminate()

    try:
        process.wait(timeout=8)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=3)
    print("LoreCue 已停止，3000 端口应已释放。")


def main() -> int:
    if page_is_lorecue():
        print(f"LoreCue 已经在运行：{LOCAL_URL}")
        webbrowser.open(LOCAL_URL)
        return 0

    if port_is_in_use():
        raise RuntimeError("端口 3000 已被其他程序占用，请先关闭该程序后再试。")

    pnpm = find_pnpm()
    environment = prepare_environment()
    install_dependencies(pnpm, environment)

    print("正在启动 LoreCue 前端样机……")
    process = subprocess.Popen(
        pnpm_command(pnpm, "exec", "vinext", "dev"),
        cwd=PROJECT_DIR,
        env=environment,
    )
    print(f"启动进程：{process.pid}")

    try:
        wait_until_ready(process)
        print(f"已打开：{LOCAL_URL}")
        print("保持此窗口开启即可体验；按 Ctrl+C 停止。")
        webbrowser.open(LOCAL_URL)
        return process.wait()
    except KeyboardInterrupt:
        print()
        terminate_process_tree(process)
        return 0
    except BaseException:
        terminate_process_tree(process)
        raise


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, TimeoutError, subprocess.CalledProcessError) as error:
        print(f"\n启动失败：{error}", file=sys.stderr)
        try:
            input("按回车键关闭窗口……")
        except EOFError:
            pass
        raise SystemExit(1) from error
