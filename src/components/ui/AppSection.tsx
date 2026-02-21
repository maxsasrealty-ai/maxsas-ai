import React from 'react';

import { SectionHeader } from './SectionHeader';

type AppSectionProps = {
  title: string;
  action?: React.ReactNode;
};

export const AppSection = ({ title, action }: AppSectionProps) => {
  return <SectionHeader title={title} action={action} />;
};
