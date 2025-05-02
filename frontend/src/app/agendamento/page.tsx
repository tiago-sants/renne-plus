'use client';

import React from 'react';
import { FiCalendar, FiClock, FiUser, FiCheck } from 'react-icons/fi';
import Link from 'next/link';

export default function AgendamentoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="bg-muted py-12 px-4 sm:px-6 lg:px-8">
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
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                  <span className="font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Escolha o serviço</h3>
                  <p className="text-muted-foreground">Selecione o serviço que deseja agendar</p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-md p-4 cursor-pointer hover:border-primary">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">Corte de Cabelo</h4>
                          <p className="text-sm text-muted-foreground">30 minutos</p>
                        </div>
                        <div>
                          <p className="font-medium">R$ 50,00</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-md p-4 cursor-pointer hover:border-primary">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">Barba</h4>
                          <p className="text-sm text-muted-foreground">20 minutos</p>
                        </div>
                        <div>
                          <p className="font-medium">R$ 35,00</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-md p-4 cursor-pointer hover:border-primary">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">Corte + Barba</h4>
                          <p className="text-sm text-muted-foreground">50 minutos</p>
                        </div>
                        <div>
                          <p className="font-medium">R$ 75,00</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-md p-4 cursor-pointer hover:border-primary">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">Sobrancelha</h4>
                          <p className="text-sm text-muted-foreground">15 minutos</p>
                        </div>
                        <div>
                          <p className="font-medium">R$ 20,00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                  <span className="font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Escolha a data</h3>
                  <p className="text-muted-foreground">Selecione o dia para o agendamento</p>
                  
                  <div className="mt-4">
                    <div className="border border-border rounded-md p-4">
                      <div className="grid grid-cols-7 gap-2 text-center">
                        <div className="text-sm font-medium text-muted-foreground">Dom</div>
                        <div className="text-sm font-medium text-muted-foreground">Seg</div>
                        <div className="text-sm font-medium text-muted-foreground">Ter</div>
                        <div className="text-sm font-medium text-muted-foreground">Qua</div>
                        <div className="text-sm font-medium text-muted-foreground">Qui</div>
                        <div className="text-sm font-medium text-muted-foreground">Sex</div>
                        <div className="text-sm font-medium text-muted-foreground">Sáb</div>
                        
                        {/* Exemplo de dias do calendário */}
                        <div className="text-sm p-2 text-muted-foreground">28</div>
                        <div className="text-sm p-2 text-muted-foreground">29</div>
                        <div className="text-sm p-2 text-muted-foreground">30</div>
                        <div className="text-sm p-2">1</div>
                        <div className="text-sm p-2">2</div>
                        <div className="text-sm p-2">3</div>
                        <div className="text-sm p-2">4</div>
                        <div className="text-sm p-2">5</div>
                        <div className="text-sm p-2">6</div>
                        <div className="text-sm p-2">7</div>
                        <div className="text-sm p-2">8</div>
                        <div className="text-sm p-2 bg-primary text-primary-foreground rounded-md">9</div>
                        <div className="text-sm p-2">10</div>
                        <div className="text-sm p-2">11</div>
                        {/* Mais dias... */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                  <span className="font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Escolha o profissional</h3>
                  <p className="text-muted-foreground">Selecione o profissional de sua preferência</p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-md p-4 cursor-pointer hover:border-primary">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-4">
                          <FiUser className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">Carlos Silva</h4>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground">★★★★★</span>
                            <span className="text-sm text-muted-foreground ml-1">(32)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-border rounded-md p-4 cursor-pointer hover:border-primary">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-4">
                          <FiUser className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">André Santos</h4>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground">★★★★☆</span>
                            <span className="text-sm text-muted-foreground ml-1">(28)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                  <span className="font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Escolha o horário</h3>
                  <p className="text-muted-foreground">Selecione um horário disponível</p>
                  
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <div className="border border-border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                      <span>09:00</span>
                    </div>
                    <div className="border border-border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                      <span>09:30</span>
                    </div>
                    <div className="border border-border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                      <span>10:00</span>
                    </div>
                    <div className="border border-primary bg-primary/10 rounded-md p-2 text-center cursor-pointer">
                      <span>10:30</span>
                    </div>
                    <div className="border border-border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                      <span>11:00</span>
                    </div>
                    <div className="border border-border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                      <span>11:30</span>
                    </div>
                    {/* Mais horários... */}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
                  <span className="font-bold">5</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground">Resumo do agendamento</h3>
                  <p className="text-muted-foreground">Confira os detalhes do seu agendamento</p>
                  
                  <div className="mt-4 bg-muted p-4 rounded-md">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Serviço:</span>
                        <span className="font-medium">Corte + Barba</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-medium">09/05/2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horário:</span>
                        <span className="font-medium">10:30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profissional:</span>
                        <span className="font-medium">Carlos Silva</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span className="font-medium">50 minutos</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2 mt-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">R$ 75,00</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 flex items-center justify-center">
                        <FiCheck className="mr-2" />
                        Confirmar Agendamento
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
