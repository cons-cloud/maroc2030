import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  loading?: boolean;
  className?: string;
};

export const StatCard = ({
  title,
  value,
  icon,
  description,
  loading = false,
  className = "",
}: StatCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
