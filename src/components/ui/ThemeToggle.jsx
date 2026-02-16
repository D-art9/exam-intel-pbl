import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';

export function ThemeToggle() {
    const [theme, setTheme] = useState(
        () => localStorage.getItem('theme') || 'light'
    );

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.add('light');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 px-0 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ml-2"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Sun className="h-4 w-4 text-muj-orange transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            ) : (
                <Moon className="h-4 w-4 text-muj-yellow transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
