# Context Menus System

This directory contains reusable context menu components for data tables throughout the application.

## Structure

```
context-menus/
├── index.ts                           # Exports all context menu components
├── base-context-menu.tsx              # Generic base context menu
├── state-context-menu.tsx             # Context menu with state management
├── team-members-context-menu.tsx      # Team member specific context menu
├── cases-context-menu.tsx             # Case specific context menu
├── organization-members-context-menu.tsx # Organization member specific context menu
└── README.md                          # This documentation
```

## Components

### BaseContextMenu

The foundation component that provides:

- Generic context menu functionality
- Additional items support (React nodes or functions)
- Proper styling and structure
- No state management (use StateContextMenu for that)

**Props:**

- `children`: React node to wrap with context menu
- `additionalItems`: Additional menu items (React node or function)
- `rowData`: Data for the current row

### StateContextMenu

A specialized context menu for state management that extends BaseContextMenu:

- State management with radio buttons
- Configurable state options
- Custom state labels
- Additional items support

**Props:**

- `children`: React node to wrap with context menu
- `availableStates`: Array of available state options
- `onStateChange`: Callback for state changes
- `currentState`: Current state value
- `additionalItems`: Additional menu items (React node or function)
- `rowData`: Data for the current row
- `stateLabel`: Label for the state submenu (default: "Status")

### TeamMembersContextMenu

Specific context menu for team member management:

- Role management (Member/Admin)
- Member removal (destructive action)
- Owner protection (can't remove/change owner)

**Props:**

- `children`: React node to wrap
- `rowData`: Team member data
- `onChangeRole`: Callback for role changes
- `onRemoveMember`: Callback for member removal

### CasesContextMenu

Specific context menu for case management:

- State transitions based on current state
- Automatic state option generation
- State change handling

**Props:**

- `children`: React node to wrap
- `rowData`: Case data
- `onStateChange`: Callback for state changes

## Usage

### In Data Tables

```tsx
import { DataTable } from '@src/components/data-table';

// For team members
const contextMenuConfig = {
	showStateOptions: false,
	additionalItems: (row: any) => {
		const memberData = row.original as MemberData;
		return (
			<>
				<div className="text-muted-foreground px-2 py-1.5 text-sm font-semibold">
					Role
				</div>
				<div
					className="hover:bg-accent cursor-pointer rounded-sm px-2 py-1.5 text-sm"
					onClick={() => handleChangeRole(memberData.membershipId, 'member')}
				>
					Member
				</div>
				{/* More items... */}
			</>
		);
	},
};

<DataTable columns={columns} data={data} contextMenu={contextMenuConfig} />;
```

### Creating New Context Menus

1. Create a new component in this directory
2. Extend `BaseContextMenu` or create a custom implementation
3. Export from `index.ts`
4. Use in your data table

Example:

```tsx
// my-custom-context-menu.tsx
import { ContextMenuItem } from '@shadcn/ui/context-menu';
import BaseContextMenu from './base-context-menu';

interface MyCustomContextMenuProps {
	children: React.ReactNode;
	rowData?: any;
	onCustomAction: (id: string) => void;
}

export default function MyCustomContextMenu({
	children,
	rowData,
	onCustomAction,
}: MyCustomContextMenuProps) {
	const additionalItems = () => (
		<ContextMenuItem onClick={() => onCustomAction(rowData.id)}>
			Custom Action
		</ContextMenuItem>
	);

	return (
		<BaseContextMenu
			showStateOptions={false}
			additionalItems={additionalItems}
			rowData={rowData}
		>
			{children}
		</BaseContextMenu>
	);
}
```

## Best Practices

1. **Type Safety**: Always define proper interfaces for your data
2. **Error Handling**: Include proper error handling in callbacks
3. **Accessibility**: Use proper ARIA labels and keyboard navigation
4. **Styling**: Follow the existing design system with proper hover states
5. **Performance**: Avoid expensive operations in render functions
6. **Security**: Validate permissions before showing destructive actions

## Styling

Context menu items should follow these patterns:

- **Headers**: `text-muted-foreground font-semibold`
- **Regular items**: `hover:bg-accent cursor-pointer rounded-sm`
- **Destructive items**: `hover:bg-accent text-destructive cursor-pointer rounded-sm`
- **Separators**: Use `ContextMenuSeparator` component
