'use client';

import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiCheck, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/components/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns'; // Para formatar a data
import { ptBR } from 'date-fns/locale'; // Para locale pt-BR

// --- Simulação de Dados (Substituir por chamadas API depois) ---
const SIMULATED_BARBERSHOP_ID = 'clx123abc456def789ghi'; // ID Fixo para simulação

const fetchServices = async (barbershopId: string) => {
  console.log(`Simulando fetch de serviços para ${barbershopId}`);
  // TODO: Substituir por chamada real: GET /api/services?barbershopId=${barbershopId}
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay
  return [
    { id: 'svc1', name: 'Corte de Cabelo', duration: 30, price: 50.00, loyaltyPoints: 10 },
    { id: 'svc2', name: 'Barba', duration: 20, price: 35.00, loyaltyPoints: 5 },
    { id: 'svc3', name: 'Corte + Barba', duration: 50, price: 75.00, loyaltyPoints: 15 },
    { id: 'svc4', name: 'Sobrancelha', duration: 15, price: 20.00, loyaltyPoints: 3 },
  ];
};

const fetchBarbers = async (barbershopId: string) => {
  console.log(`Simulando fetch de barbeiros para ${barbershopId}`);
  // TODO: Substituir por chamada real: GET /api/barbers?barbershopId=${barbershopId}
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay
  return [
    { id: 'barber1', userId: 'user1', name: 'Carlos Silva', rating: 4.8, ratingCount: 32, specialties: ['Corte', 'Barba'] },
    { id: 'barber2', userId: 'user2', name: 'André Santos', rating: 4.5, ratingCount: 28, specialties: ['Corte'] },
  ];
};

const fetchAvailability = async (barberId: string, date: string) => {
  if (!barberId || !date) return { availableTimes: [] };
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/availability?barberId=${barberId}&date=${date}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao buscar disponibilidade');
  }
  return res.json();
};

const createAppointmentAPI = async ({ token, appointmentData }: { token: string, appointmentData: any }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(appointmentData),
  });
  if (!res.ok) {
    const errorData = await res.json();
     if (errorData.errors && Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.map((err: any) => err.msg).join(', '));
      } else {
        throw new Error(errorData.message || 'Erro ao criar agendamento');
      }
  }
  return res.json();
};
// --- Fim da Simulação e Funções API ---

export default function AgendamentoPage() {
  const { token, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Inicia com data atual
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // --- Queries React Query ---
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services', SIMULATED_BARBERSHOP_ID],
    queryFn: () => fetchServices(SIMULATED_BARBERSHOP_ID),
  });

  const { data: barbers, isLoading: isLoadingBarbers } = useQuery({
    queryKey: ['barbers', SIMULATED_BARBERSHOP_ID],
    queryFn: () => fetchBarbers(SIMULATED_BARBERSHOP_ID),
  });

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const { data: availability, isLoading: isLoadingAvailability, error: availabilityError } = useQuery({
    queryKey: ['availability', selectedBarberId, formattedDate],
    queryFn: () => fetchAvailability(selectedBarberId!, formattedDate),
    enabled: !!selectedBarberId && !!selectedDate, // Só executa se barbeiro e data estiverem selecionados
  });

  // --- Mutation React Query ---
  const mutation = useMutation({
    mutationFn: createAppointmentAPI,
    onSuccess: (data) => {
      console.log('Agendamento criado:', data);
      setFormSuccess('Agendamento confirmado com sucesso!');
      setFormError(null);
      // Limpar seleções ou redirecionar
      setSelectedServiceId(null);
      setSelectedBarberId(null);
      setSelectedTime(null);
      // Invalidar queries relacionadas se necessário
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      // queryClient.invalidateQueries({ queryKey: ['clientAppointments'] }); // Para atualizar lista de agendamentos do cliente
    },
    onError: (error: any) => {
      console.error('Erro ao criar agendamento:', error);
      setFormError(error.message || 'Não foi possível confirmar o agendamento.');
      setFormSuccess(null);
    },
  });

  // --- Handlers ---
  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedBarberId(null); // Reseta barbeiro e horário ao mudar serviço
    setSelectedTime(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reseta horário ao mudar data
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSelectBarber = (barberId: string) => {
    setSelectedBarberId(barberId);
    setSelectedTime(null); // Reseta horário ao mudar barbeiro
    setFormError(null);
    setFormSuccess(null);
  };

   const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleConfirmAppointment = () => {
    setFormError(null);
    setFormSuccess(null);

    if (!isAuthenticated || !token || !user) {
      setFormError('Você precisa estar logado para agendar.');
      // Opcional: redirecionar para login
      return;
    }

    if (!selectedServiceId || !selectedDate || !selectedBarberId || !selectedTime) {
      setFormError('Por favor, selecione serviço, data, profissional e horário.');
      return;
    }

    const appointmentData = {
      date: formattedDate,
      time: selectedTime,
      barberId: selectedBarberId,
      serviceId: selectedServiceId,
      barbershopId: SIMULATED_BARBERSHOP_ID, // Usando ID simulado
      // notes: 'Alguma nota opcional aqui' // Adicionar campo se necessário
    };

    mutation.mutate({ token, appointmentData });
  };

  // --- Seletores de Dados ---
  const selectedService = services?.find(s => s.id === selectedServiceId);
  const selectedBarber = barbers?.find(b => b.id === selectedBarberId);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="bg-muted py-12 px-4 sm:px-6 lg:px-8">
        {/* ... (código do header igual ao anterior) ... */}
         <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Agendamento
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Agende seu horário de forma rápida e fácil com os melhores profissionais.
            </p>
          </div>
        </div>
      </section>

      {/* Agendamento Form Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card shadow-md rounded-lg p-6 border border-border">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Faça seu agendamento</h2>

              {/* Mensagens de Erro/Sucesso */} 
              {formError && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{formSuccess}</span>
                </div>
              )}

              {/* 1. Escolha o Serviço */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  <span className="font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Escolha o serviço</h3>
                  {isLoadingServices ? (
                    <FiLoader className="animate-spin h-6 w-6 text-primary mt-4" />
                  ) : (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services?.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => handleSelectService(service.id)}
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${selectedServiceId === service.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                        >
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-muted-foreground">{service.duration} minutos</p>
                            </div>
                            <div>
                              <p className="font-medium">R$ {service.price.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Escolha a Data */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                 <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  <span className="font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Escolha a data</h3>
                   {/* TODO: Implementar um componente de calendário real (ex: react-day-picker) */}
                   <input 
                     type="date" 
                     value={formattedDate}
                     onChange={(e) => handleSelectDate(new Date(e.target.value + 'T00:00:00'))} // Ajuste para evitar problemas de fuso
                     min={format(new Date(), 'yyyy-MM-dd')} // Não permite datas passadas
                     className="mt-4 p-2 border rounded-md w-full md:w-auto"
                     disabled={!selectedServiceId} // Habilita após escolher serviço
                   />
                </div>
              </div>

              {/* 3. Escolha o Profissional */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                 <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  <span className="font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Escolha o profissional</h3>
                  {isLoadingBarbers ? (
                     <FiLoader className="animate-spin h-6 w-6 text-primary mt-4" />
                  ) : (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                       {barbers?.map((barber) => (
                        <div
                          key={barber.id}
                          onClick={() => handleSelectBarber(barber.id)}
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${!selectedDate ? 'opacity-50 cursor-not-allowed' : ''} ${selectedBarberId === barber.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                        >
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-4">
                              <FiUser className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <h4 className="font-medium">{barber.name}</h4>
                              {/* <div className="flex items-center">
                                <span className="text-sm text-muted-foreground">★★★★★</span>
                                <span className="text-sm text-muted-foreground ml-1">({barber.ratingCount})</span>
                              </div> */} 
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Escolha o Horário */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                 <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  <span className="font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Escolha o horário</h3>
                  {isLoadingAvailability ? (
                     <FiLoader className="animate-spin h-6 w-6 text-primary mt-4" />
                  ) : availabilityError ? (
                     <p className="text-red-500 mt-4">Erro ao buscar horários.</p>
                  ) : !selectedBarberId || !selectedDate ? (
                     <p className="text-muted-foreground mt-4">Selecione data e profissional.</p>
                  ) : availability?.availableTimes.length === 0 ? (
                     <p className="text-muted-foreground mt-4">Nenhum horário disponível para esta data/profissional.</p>
                  ) : (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availability?.availableTimes.map((time: string) => (
                        <div
                          key={time}
                          onClick={() => handleSelectTime(time)}
                          className={`border rounded-md p-2 text-center cursor-pointer transition-colors ${selectedTime === time ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'}`}
                        >
                          <span>{time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Resumo e Confirmação */}
              {(selectedService && selectedDate && selectedBarber && selectedTime) && (
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                   <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground flex-shrink-0">
                    <span className="font-bold">5</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">Resumo do agendamento</h3>
                    <div className="mt-4 bg-muted p-4 rounded-md">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Serviço:</span>
                          <span className="font-medium">{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data:</span>
                          <span className="font-medium">{format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Horário:</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Profissional:</span>
                          <span className="font-medium">{selectedBarber.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duração:</span>
                          <span className="font-medium">{selectedService.duration} minutos</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 mt-2">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold">R$ {selectedService.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={handleConfirmAppointment}
                          disabled={mutation.isPending || !isAuthenticated}
                          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 flex items-center justify-center disabled:opacity-50"
                        >
                          {mutation.isPending ? (
                            <FiLoader className="animate-spin mr-2" />
                          ) : (
                            <FiCheck className="mr-2" />
                          )}
                          {isAuthenticated ? (mutation.isPending ? 'Confirmando...' : 'Confirmar Agendamento') : 'Faça login para confirmar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

