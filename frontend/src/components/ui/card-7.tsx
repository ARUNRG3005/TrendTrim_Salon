"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface InteractiveProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
    imageUrl: string;
    logoUrl: string;
    title: string;
    description: string;
    price: string;
}

export function InteractiveProductCard({
    className,
    imageUrl,
    logoUrl,
    title,
    description,
    price,
    ...props
}: InteractiveProductCardProps) {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const [style, setStyle] = React.useState<React.CSSProperties>({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        const rotateX = ((y - height / 2) / (height / 2)) * -8;
        const rotateY = ((x - width / 2) / (width / 2)) * 8;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
            transition: "transform 0.1s ease-out",
            transformStyle: "preserve-3d",
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            transition: "transform 0.4s ease-in-out",
            transformStyle: "preserve-3d",
        });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={style}
            className={cn(
                "group relative w-full max-w-[340px] rounded-3xl bg-card shadow-lg overflow-hidden h-full flex flex-col",
                className
            )}
            {...props}
        >
            <div className="relative flex-grow overflow-hidden">
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            <div className="relative flex flex-col gap-3 bg-black/30 p-5 backdrop-blur-xl">
                <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="text-xs text-white/70">{description}</p>
                    </div>
                    <img src={logoUrl} alt="Brand Logo" className="h-4 w-auto" />
                </div>

                <div className="rounded-full bg-black/40 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm w-max">
                    {price}
                </div>

                <div className="mt-auto flex w-full justify-center gap-2 pb-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                index === 0 ? "bg-white" : "bg-white/30"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
