'use client';

import { Popover as PopoverRoot, PopoverTrigger, PopoverContent } from '@heroui/popover';
import * as React from 'react';

/**
 * Popover component for displaying contextual information or actions
 * Wraps the HeroUI Popover components with simplified props interface
 *
 * @param placement - Position of the popover relative to trigger (default: 'top')
 * @param offset - Distance between popover and trigger element
 * @param trigger - Element that triggers the popover when clicked
 * @param children - Content to display inside the popover
 * @param onOpenChange - Callback fired when popover open state changes
 * @param extraProps - Additional props passed to the root Popover component
 */
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
