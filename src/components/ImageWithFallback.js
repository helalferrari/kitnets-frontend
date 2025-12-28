'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ImageWithFallback({ src, alt, ...props }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    const handleError = () => {
        setHasError(true);
        // Gerar um placeholder SVG local (Data URI)
        const text = alt ? alt.slice(0, 20) : 'Kitnet';
        const svg = `
<svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="400" fill="#e2e8f0"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#475569">
        ${text}
    </text>
</svg>`;
        const encoded = typeof window !== 'undefined' ? window.btoa(svg) : Buffer.from(svg).toString('base64');
        setImgSrc(`data:image/svg+xml;base64,${encoded}`);
    };

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={handleError}
            unoptimized={hasError} // Desativa otimização do Next.js para o placeholder externo se necessário
        />
    );
}
