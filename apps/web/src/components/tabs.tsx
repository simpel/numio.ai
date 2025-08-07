'use client';

import { useState } from 'react';
import {
	Tabs as TabsPrimitive,
	TabsList,
	TabsTrigger,
	TabsContent,
} from '@shadcn/ui/tabs';

interface TabItem {
	id: string;
	label: string;
	content: React.ReactNode;
}

interface TabsProps {
	tabs: TabItem[];
	defaultTab?: string;
	className?: string;
}

export default function Tabs({ tabs, defaultTab, className }: TabsProps) {
	const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

	if (!tabs.length) {
		return null;
	}

	return (
		<TabsPrimitive
			value={activeTab}
			onValueChange={setActiveTab}
			className={className}
		>
			<TabsList className="grid w-full grid-cols-1 lg:grid-cols-3">
				{tabs.map((tab) => (
					<TabsTrigger key={tab.id} value={tab.id}>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
			{tabs.map((tab) => (
				<TabsContent key={tab.id} value={tab.id} className="mt-6">
					{tab.content}
				</TabsContent>
			))}
		</TabsPrimitive>
	);
}
