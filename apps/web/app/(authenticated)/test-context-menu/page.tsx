'use client';

import { useState } from 'react';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from '@shadcn/ui/context-menu';

export default function TestContextMenuPage() {
	const [currentState, setCurrentState] = useState('created');

	const handleStateChange = (newState: string) => {
		console.log('State changed to:', newState);
		setCurrentState(newState);
	};

	return (
		<div className="space-y-8 p-8">
			<h1 className="text-2xl font-bold">Context Menu Test</h1>

			<div className="space-y-4">
				<h2 className="text-lg font-semibold">
					Test 1: Basic shadcn context menu
				</h2>
				<ContextMenu>
					<ContextMenuTrigger asChild>
						<div className="cursor-pointer rounded border border-gray-300 bg-gray-50 p-4">
							Right-click here to test basic context menu
						</div>
					</ContextMenuTrigger>
					<ContextMenuContent className="w-64">
						<ContextMenuItem onClick={() => handleStateChange('active')}>
							Active
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleStateChange('on_hold')}>
							On Hold
						</ContextMenuItem>
						<ContextMenuItem onClick={() => handleStateChange('completed')}>
							Completed
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
			</div>

			<div className="space-y-4">
				<h2 className="text-lg font-semibold">
					Test 2: Table row with basic context menu
				</h2>
				<table className="w-full border-collapse border border-gray-300">
					<thead>
						<tr>
							<th className="border border-gray-300 p-2">Name</th>
							<th className="border border-gray-300 p-2">Status</th>
						</tr>
					</thead>
					<tbody>
						<ContextMenu>
							<ContextMenuTrigger asChild>
								<tr className="cursor-pointer border border-gray-300">
									<td className="border border-gray-300 p-2">Test Case</td>
									<td className="border border-gray-300 p-2">{currentState}</td>
								</tr>
							</ContextMenuTrigger>
							<ContextMenuContent className="w-64">
								<ContextMenuItem onClick={() => handleStateChange('active')}>
									Active
								</ContextMenuItem>
								<ContextMenuItem onClick={() => handleStateChange('on_hold')}>
									On Hold
								</ContextMenuItem>
								<ContextMenuItem onClick={() => handleStateChange('completed')}>
									Completed
								</ContextMenuItem>
							</ContextMenuContent>
						</ContextMenu>
					</tbody>
				</table>
			</div>

			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Current State: {currentState}</h2>
			</div>
		</div>
	);
}
