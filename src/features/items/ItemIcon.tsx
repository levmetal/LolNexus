import React, { useState } from 'react';

interface ItemIconProps {
    id: string | number;
    name: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

const DDRAGON_VERSIONS = ['15.4.1', '14.23.1', '14.4.1'];

const ItemIcon: React.FC<ItemIconProps> = ({ id, name, size = 48, className = '', style = {} }) => {
    const [retryCount, setRetryCount] = useState(0);
    const [failed, setFailed] = useState(false);

    const getUrl = (vIdx: number) =>
        `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSIONS[vIdx]}/img/item/${id}.png`;

    const handleError = () => {
        if (retryCount < DDRAGON_VERSIONS.length - 1) {
            setRetryCount(prev => prev + 1);
        } else {
            setFailed(true);
        }
    };

    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div
            className={`item-icon-container ${className}`}
            style={{
                width: size,
                height: size,
                position: 'relative',
                ...style
            }}
            title={name}
        >
            {!failed ? (
                <img
                    src={getUrl(retryCount)}
                    alt={name}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                    onError={handleError}
                    loading="lazy"
                />
            ) : (
                <div className="item-fallback-placeholder">
                    {initials}
                </div>
            )}
        </div>
    );
};

export default ItemIcon;
