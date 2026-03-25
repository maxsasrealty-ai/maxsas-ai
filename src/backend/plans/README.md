# Plans Architecture

Each plan has its own folder:
- **nexus/**: Nexus plan logic
- **enterprise/**: Enterprise plan logic

## Adding a New Plan
1. Create folder: plans/newPlan/
2. Implement: newPlanProcessor.ts, newPlanRules.ts
3. Register in planResolver

No changes required in core.
