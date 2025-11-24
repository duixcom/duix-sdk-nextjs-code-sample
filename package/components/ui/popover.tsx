'use client';

import { Popover as PopoverRoot, PopoverTrigger, PopoverContent } from '@heroui/popover';
import * as React from 'react';

const Popover = ({
    placement = 'top',
    trigger,
    children,
    offset,
    onOpenChange,
    ...extraProps
}: {
    placement?: string;
    offset?: number;
    trigger?: React.ReactNode;
    className?: string;
    children: React.ReactNode | React.ReactNode[];
    onOpenChange?: (open: boolean) => void;
}) => {
    return (
        <PopoverRoot onOpenChange={onOpenChange} offset={offset} {...extraProps} placement={placement as any}>
            <PopoverTrigger>{trigger}</PopoverTrigger>
            <PopoverContent>{children}</PopoverContent>
        </PopoverRoot>
    );
};

export { Popover };
