'use client'; // Necessário para usar hooks como useState, useQuery, etc.

import React from 'react';
import { useParams } from 'next/navigation'; // Importa o hook para obter parâmetros da URL
import ClientQueueView from '@/components/queue/ClientQueueView'; // Importa o componente que criamos

// Esta é a definição do componente da página
export default function QueuePage() {

    // --- Obtenção do ID da Barbearia ---
    const params = useParams();
    const barbershopIdAtual = params?.barbershopId as string;
    // -----------------------------------

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Fila de Espera</h1>

            {/* Verifica se temos um ID de barbearia antes de renderizar o componente */}
            {barbershopIdAtual ? (
                <div className="max-w-md mx-auto">
                    <ClientQueueView barbershopId={barbershopIdAtual} />
                </div>
            ) : (
                <p className="text-center text-muted-foreground">ID da barbearia não encontrado.</p>
                // Ou mostrar um seletor de barbearias
            )}

            {/* Você pode adicionar mais conteúdo à página aqui, se necessário */}

        </div>
    );
}
