"use client";
import { useEffect, useRef, useState } from "react";

export function ChangingWord({ words, interval = 2500 }: { words: string[]; interval?: number }) {
    const [index, setIndex] = useState(0);
    const [width, setWidth] = useState<number>();
    const refs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        const t = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
        return () => clearInterval(t);
    }, [words.length, interval]);

    useEffect(() => {
        setWidth(refs.current[index]?.offsetWidth);
    }, [index]);

    const prev = (index - 1 + words.length) % words.length;

    return (
        <span
            className="relative inline-block overflow-hidden align-bottom transition-[width] duration-500 ease-in-out"
            style={{ width }}
        >
            {words.map((w, i) => (
                <span
                    key={w}
                    ref={(el) => {
                        refs.current[i] = el;
                    }}
                    className={`inline-block whitespace-nowrap text-red-600 ${i === 0 ? "" : "absolute left-0 top-0"
                        } ${i === index
                            ? "translate-y-0 opacity-100 transition-all duration-500"
                            : i === prev
                                ? "-translate-y-full opacity-0 transition-all duration-500"
                                : "translate-y-full opacity-0 transition-none"
                        }`}
                >
                    {w}
                </span>
            ))}
        </span>
    );
}