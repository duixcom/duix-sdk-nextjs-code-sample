import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';
import { cn } from '../../lib';
import { buttonVariants } from '../common';

export type ButtonProps = ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        isActive?: boolean;
        isOnlyIcon?: boolean;
        loading?: boolean;
        comp?: React.ElementType;
    };

function BaseButton({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

function Button({ isOnlyIcon, loading, children, ...props }: ButtonProps) {
    return (
        <BaseButton {...props}>
            <>
                {loading ? <ArrowPathIcon className="size-4.5 animate-spin" /> : null}
                {isOnlyIcon && loading ? null : children}
            </>
        </BaseButton>
    );
}

export { Button, type buttonVariants };
