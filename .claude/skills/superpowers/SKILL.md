---
name: superpowers
description: "Complete software development workflow system with spec-driven planning, subagent-driven development, TDD, systematic debugging, code review, and git worktrees. TRIGGER when: setting up a new project or needing structured development workflow. Always included in every project."
license: MIT
---

# Superpowers — Development Workflow System

Superpowers is a complete software development workflow built on composable skills, agents, commands, and hooks. It enforces spec-driven development, TDD, and subagent-driven execution.

## Package

```bash
npm install "https://github.com/obra/superpowers.git"
```

## What It Provides

### Skills (Auto-Triggering Workflows)
| Skill | What It Does |
|-------|-------------|
| `brainstorming` | Structured ideation before jumping to code |
| `writing-plans` | Spec-driven planning with clear implementation steps |
| `executing-plans` | Phased execution following the plan |
| `subagent-driven-development` | Delegates tasks to focused subagents |
| `test-driven-development` | Red/green TDD enforcement |
| `systematic-debugging` | Structured debugging methodology |
| `requesting-code-review` | Prepares work for review |
| `receiving-code-review` | Processes and applies review feedback |
| `dispatching-parallel-agents` | Runs multiple agents concurrently |
| `using-git-worktrees` | Isolated git worktrees for parallel work |
| `verification-before-completion` | Final checks before marking done |
| `finishing-a-development-branch` | Clean branch finalization |

### Agents
| Agent | Role |
|-------|------|
| `code-reviewer` | Reviews code for quality, correctness, and best practices |

### Commands
| Command | What It Does |
|---------|-------------|
| `/brainstorm` | Start a structured brainstorming session |
| `/write-plan` | Create a spec-driven implementation plan |
| `/execute-plan` | Execute a plan with subagent-driven development |

### Hooks
- **Session start hook** — Automatically activates superpowers workflow on session start

## How It Works

1. **Spec first** — Before writing code, it draws out what you're really trying to build
2. **Plan** — Creates implementation plans clear enough for autonomous execution
3. **Execute** — Launches subagents to work through tasks, reviewing their output
4. **Verify** — Checks work before completion, enforces TDD
5. **Review** — Code review workflow built in

## Installation in Projects

Copy the full `superpowers` package contents into the project. The skills, agents, commands, and hooks auto-activate based on context.

### File Structure in Project
```
.claude/
  skills/superpowers/        # All superpowers skills
  agents/code-reviewer.md    # Code reviewer agent
  commands/                  # Slash commands
hooks.json                   # Session hooks
```

## Integration Notes

- Superpowers skills trigger automatically based on conversation context
- Works alongside GSD framework — complementary workflow systems
- The subagent-driven development skill is the core execution engine
- TDD is enforced by default (red/green cycle)
- Git worktrees enable parallel isolated work streams
- Verification runs automatically before any task is marked complete
