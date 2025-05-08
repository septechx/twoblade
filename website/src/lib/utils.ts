import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const USERNAME_REGEX = /^[a-zA-Z0-9_\-!$%&'*/?=^@.]+$/;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function getRandomColor(name: string): string {
    const colors = [
        'bg-blue-100 text-blue-800',
        'bg-green-100 text-green-800',
        'bg-purple-100 text-purple-800',
        'bg-amber-100 text-amber-800',
        'bg-rose-100 text-rose-800',
        'bg-teal-100 text-teal-800',
        'bg-indigo-100 text-indigo-800'
    ];

    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

export function formatFileSize(bytes: number) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
    }

    return `${size.toFixed(1)} ${units[unit]}`;
}

export function getDominantColor(imgEl: HTMLImageElement): Promise<string> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('rgb(0, 0, 0)');

        canvas.width = 1;
        canvas.height = 1;

        ctx.drawImage(imgEl, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

        resolve(`rgb(${r}, ${g}, ${b})`);
    });
}

export async function downloadFile(url: string, filename: string) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
    }
}


export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: number | undefined;
    let promiseResolve: ((value: ReturnType<T>) => void) | undefined;

    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
        return new Promise((resolve) => {
            clearTimeout(timeoutId);
            promiseResolve = resolve;

            timeoutId = window.setTimeout(async () => {
                const result = await fn(...args);
                if (promiseResolve) {
                    promiseResolve(result);
                }
            }, delay);
        });
    };
}

export function validateUsername(username: string): boolean {
    if (username.length > 20) {
        return false;
    }

    if (!USERNAME_REGEX.test(username)) {
        return false
    }
    return true;
}

// THIS IS LINKED TO ../../SHARP/main.js
// In order to make SHARP be usable without the website src, we use the same function there without importing it
export function checkVocabulary(text: string, iq: number): { isValid: boolean; limit: number | null } {
    let maxWordLength: number;

    if (iq < 90) maxWordLength = 3;
    else if (iq < 100) maxWordLength = 4;
    else if (iq < 120) maxWordLength = 5;
    else if (iq < 130) maxWordLength = 6;
    else if (iq < 140) maxWordLength = 7;
    else return { isValid: true, limit: null };

    const words = text.split(/\s+/);
    for (const word of words) {
        const cleanedWord = word.replace(/[.,!?;:"']/g, '');
        if (cleanedWord.length > maxWordLength) {
            return { isValid: false, limit: maxWordLength };
        }
    }
    return { isValid: true, limit: maxWordLength };
}