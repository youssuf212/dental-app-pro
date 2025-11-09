

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-border-color">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-text-tertiary'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-all`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon && <tab.icon className="w-5 h-5 mr-2" />}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
