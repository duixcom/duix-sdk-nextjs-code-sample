import { cva } from 'class-variance-authority';

export const sizes: Record<string, string> = {
    sm: 'cb:body-s cb:gap-2 cb:rounded-8xl',
    md: 'cb:body-s cb:gap-2 cb:rounded-8xl',
    lg: 'cb:body-l cb:gap-2 cb:rounded-8xl'
};

export const commonClass: Record<string, string> = {
    sm: 'cb:px-6 cb:h-8',
    md: 'cb:px-6 cb:h-9.5',
    lg: 'cb:px-6 cb:h-12'
};

export const buttonVariants = cva(
    'cb:w-fit cb:inline-flex cb:items-center cb:justify-center cb:hover:cursor-pointer cb:disabled:cursor-not-allowed cb:disabled:opacity-50',
    {
        variants: {
            variant: {
                default: ''
            },
            size: {
                default: ''
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);
