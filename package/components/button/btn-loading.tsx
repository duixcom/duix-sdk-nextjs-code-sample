import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { type ReactNode } from 'react';
import { Button } from '.';

export function ButtonLoading({ children }: { children: ReactNode }) {
    return (
        <Button disabled>
            <ArrowPathIcon className="cb:animate-spin" />
            {children}
        </Button>
    );
}

export function ButtonLoadingIcon() {
    return (
        <Button disabled>
            <ArrowPathIcon className="cb:animate-spin" />
        </Button>
    );
}
