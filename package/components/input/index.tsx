import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib';

const InputVariants = cva(
    'cb:w-full cb:flex cb:placeholder:text-muted-foreground cb:selection:bg-primary cb:selection:text-primary-foreground cb:bg-transparent cb:transition-[color,box-shadow] cb:outline-none  cb:disabled:pointer-events-none cb:disabled:cursor-not-allowed cb:disabled:opacity-50  cb:focus-visible:border-ring cb:focus-visible:ring-ring/50 cb:focus-visible:ring-[1px] cb:aria-invalid:ring-destructive/20  cb:aria-invalid:border-destructive',
    {
        variants: {
            variant: {
                default: 'cb:placeholder:text-secondary-text cb:bg-light-grey',
                primary: '',
                secondary: ''
            },
            size: {
                default: '',
                sm: `cb:rounded-[4px] cb:h-8 cb:px-1.5`,
                md: `cb:rounded-[4px] cb:h-9.5 cb:px-1.5`,
                lg: `cb:rounded-[6px] cb:h-12 cb:body-s cb:px-1.5`
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

function Input({
    className,
    variant,
    type,
    size,
    ...props
}: VariantProps<typeof InputVariants> &
    React.ComponentProps<'input'> & {
        size?: 'lg' | 'md' | 'sm' | 'default' | undefined;
    }) {
    return (
        <input type={type} data-slot="input" className={cn(InputVariants({ variant, size }), className)} {...props} />
    );
}

export { Input };
