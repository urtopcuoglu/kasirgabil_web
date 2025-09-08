// src/app/component_page/BankCard.tsx
import React from 'react';
import Image from 'next/image';

interface BankCardProps {
    logoSrc: string;
    accountName: string;
    branch?: string; // Optional field
    accountNumber?: string; // Optional field
    iban: string;
}

const BankCard: React.FC<BankCardProps> = ({
                                               logoSrc,
                                               accountName,
                                               branch,
                                               accountNumber,
                                               iban
                                           }) => {
    return (
        <div className="flex flex-col items-center text-center p-4">
            <div className="relative w-48 h-12 mb-4">
                <Image
                    src={logoSrc}
                    alt={accountName}
                    layout="fill"
                    objectFit="contain"
                />
            </div>
            <div className="text-sm space-y-1">
                <p>
                    <span className="font-semibold text-[var(--color-primary)]">Hesap Adı:</span> {accountName}
                </p>
                {branch && (
                    <p>
                        <span className="font-semibold text-[var(--color-primary)]">Şube:</span> {branch}
                    </p>
                )}
                {accountNumber && (
                    <p>
                        <span className="font-semibold text-[var(--color-primary)]">Hesap No:</span> {accountNumber}
                    </p>
                )}
                <p>
                    <span className="font-semibold text-[var(--color-primary)]">IBAN:</span> {iban}
                </p>
            </div>
        </div>
    );
};

export default BankCard;