"use client";

import { useMemo, useState } from "react";
import {
  creativeNavigationGroups,
  type CreativeKind,
  type CreativeStudioView,
} from "./creative_project_data";

interface CreativeProjectNavigationProps {
  activeView: CreativeStudioView;
  projectKind: CreativeKind;
  onViewChange: (view: CreativeStudioView) => void;
}

export function CreativeProjectNavigation({
  activeView,
  projectKind,
  onViewChange,
}: CreativeProjectNavigationProps) {
  const [query, setQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const visibleGroups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return creativeNavigationGroups
      .filter((group) => !group.moduleOnly || projectKind === "跑团模组")
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          !normalized || item.view.toLocaleLowerCase("zh-CN").includes(normalized),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [projectKind, query]);

  function handleToggleGroup(groupId: string) {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  return (
    <div className="project-navigation">
      <label className="project-navigation-search">
        <span className="sr-only">项目内搜索</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="项目内搜索"
        />
        <kbd>⌘ K</kbd>
      </label>

      <section className="navigation-shortcuts" aria-label="收藏与最近使用">
        <span>收藏与最近使用</span>
        <div>
          {(["角色档案", "故事树", projectKind === "跑团模组" ? "线索网络" : "人物关系图"] as CreativeStudioView[]).map((view) => (
            <button key={view} onClick={() => onViewChange(view)}>{view}</button>
          ))}
        </div>
      </section>

      <nav className="hierarchical-navigation" aria-label="项目内容分级">
        {visibleGroups.map((group) => {
          const collapsed = collapsedGroups.has(group.id) && !query;
          return (
            <section key={group.id}>
              <button
                className="navigation-group-toggle"
                onClick={() => handleToggleGroup(group.id)}
                aria-expanded={!collapsed}
                aria-controls={`navigation-group-${group.id}`}
              >
                <span>{group.label}</span>
                <small>{group.items.length}</small>
                <b aria-hidden="true">{collapsed ? "＋" : "−"}</b>
              </button>
              <div id={`navigation-group-${group.id}`} hidden={collapsed}>
                {group.items.map((item) => (
                  <button
                    className={activeView === item.view ? "active" : ""}
                    key={item.view}
                    onClick={() => onViewChange(item.view)}
                    aria-current={activeView === item.view ? "page" : undefined}
                  >
                    <span aria-hidden="true">{item.shortLabel}</span>
                    <strong>{item.view}</strong>
                    {item.count !== undefined && <small>{item.count}</small>}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </nav>
    </div>
  );
}
