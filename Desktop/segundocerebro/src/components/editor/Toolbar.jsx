import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Toolbar = ({ buttons, onFormat, activeFormats }) => {
  return (
    <div className="bg-muted p-2 border-b flex flex-wrap gap-1 items-center">
      {buttons.map((btn) => (
        <Button
          key={btn.label}
          variant="ghost"
          size="sm"
          onClick={() => btn.action ? btn.action() : onFormat(btn.cmd, btn.value)}
          className={cn(
            "h-8 px-2 transition-colors duration-150",
            activeFormats[btn.formatKey || btn.cmd] 
              ? "bg-primary/20 text-primary hover:bg-primary/30" 
              : btn.isPrimary ? "text-primary hover:bg-primary/10" : "hover:bg-accent hover:text-accent-foreground"
          )}
          title={btn.label}
        >
          {btn.icon}
        </Button>
      ))}
    </div>
  );
};

export default Toolbar;