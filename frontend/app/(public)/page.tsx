'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg py-3' 
          : 'bg-transparent py-6'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-2.5 rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className={`text-2xl sm:text-3xl font-black transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                Карта Помощи
              </span>
            </Link>
            <Link 
              href="/auth"
              className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                isScrolled
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                  : 'bg-white/20 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/30'
              }`}
            >
              Войти
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-pink-600">
          {/* Animated gradient orbs */}
          <div 
            className="absolute w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
            style={{
              top: `${mousePosition.y / 20}px`,
              left: `${mousePosition.x / 20}px`,
            }}
          ></div>
          <div 
            className="absolute w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
            style={{
              top: `${mousePosition.y / 15}px`,
              right: `${mousePosition.x / 15}px`,
            }}
          ></div>
          <div 
            className="absolute w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
            style={{
              bottom: `${mousePosition.y / 25}px`,
              left: `${mousePosition.x / 25}px`,
            }}
          ></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-full text-sm font-bold border border-white/30 shadow-2xl">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
              Социальный проект
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-8 leading-tight tracking-tight">
              Ваша безопасность
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent animate-gradient">
                всегда с вами
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
              Пластиковая карта с жизненно важной медицинской информацией и QR-кодом для экстренных ситуаций
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-16">
              <Link 
                href="/auth"
                className="group relative px-10 py-5 bg-white text-red-600 rounded-2xl font-black text-lg sm:text-xl shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 overflow-hidden w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Создать карту
                  <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <a 
                href="#features"
                className="px-10 py-5 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-bold text-lg sm:text-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl w-full sm:w-auto"
              >
                Узнать больше
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-white/90">
              {[
                { icon: '✓', text: 'Безопасно' },
                { icon: '⚡', text: 'Быстро' },
                { icon: '🎯', text: 'Просто' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">{item.icon}</span>
                  <span className="text-sm sm:text-base font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative py-20 sm:py-28 lg:py-32 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Всё что нужно
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Вся необходимая информация для экстренной помощи в одном месте
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              {
                title: 'Экстренные контакты',
                desc: 'Контакты близких людей, которым позвонят в критической ситуации',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
                gradient: 'from-red-500 to-red-600',
                bgGradient: 'from-red-50 to-white'
              },
              {
                title: 'Медицинские данные',
                desc: 'Группа крови, аллергии, хронические заболевания и принимаемые лекарства',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                gradient: 'from-blue-500 to-blue-600',
                bgGradient: 'from-blue-50 to-white'
              },
              {
                title: 'QR-код',
                desc: 'Доступ к полному онлайн-профилю с детальной медицинской информацией',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                ),
                gradient: 'from-purple-500 to-purple-600',
                bgGradient: 'from-purple-50 to-white'
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-lg opacity-0 group-hover:opacity-75 transition duration-300`}></div>
                <div className={`relative bg-gradient-to-br ${feature.bgGradient} p-8 sm:p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 h-full`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 text-white`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 sm:py-28 lg:py-32 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-blue-50/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Как это работает
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Простой процесс создания карты, которая может спасти жизнь
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="space-y-8 sm:space-y-12">
              {[
                {
                  step: '1',
                  title: 'Заполните данные',
                  desc: 'Укажите ФИО, контакты близких, группу крови, аллергии и другую важную медицинскую информацию',
                  color: 'from-red-500 to-red-600'
                },
                {
                  step: '2',
                  title: 'Получите карту',
                  desc: 'Мы изготовим пластиковую карту с вашими данными и QR-кодом на онлайн-профиль',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  step: '3',
                  title: 'Носите с собой',
                  desc: 'Храните карту в кошельке или на шнурке. В экстренной ситуации она поможет врачам быстро получить нужную информацию',
                  color: 'from-green-500 to-green-600'
                }
              ].map((item, index) => (
                <div key={index} className="relative flex flex-col sm:flex-row gap-6 sm:gap-8 items-start group">
                  <div className="flex-shrink-0 relative z-10">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl text-white shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1">
                    <h3 className="text-2xl sm:text-3xl font-black mb-4 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-lg sm:text-xl leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Card Preview */}
      <section className="relative py-20 sm:py-28 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Как выглядит карта
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Пластиковая карта размером с банковскую. Удобно носить в кошельке или на шнурке
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {[
                { side: 'Лицевая сторона', bg: 'from-red-500 to-red-700' },
                { side: 'Обратная сторона', bg: 'from-blue-500 to-blue-700' }
              ].map((card, index) => (
                <div key={index} className="group">
                  <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 text-center">{card.side}</h3>
                  <div className={`relative bg-gradient-to-br ${card.bg} border-2 border-gray-200 rounded-3xl shadow-2xl overflow-hidden aspect-[1.586/1] transform group-hover:scale-105 transition-transform duration-300`}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative h-full p-6 sm:p-8 flex flex-col justify-between">
                      <div className="text-white text-sm sm:text-base font-bold text-center mb-4">
                        КАРТА ЭКСТРЕННОЙ ПОМОЩИ
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="text-xl sm:text-2xl font-black">Иванов Иван</div>
                          <div className="text-sm sm:text-base mt-2 opacity-90">+7 (900) 123-45-67</div>
                        </div>
                      </div>
                      <div className="text-white text-xs sm:text-sm font-bold text-center">
                        Сканируйте QR-код для полной информации
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 text-lg sm:text-xl">
                Размер карты: 85.6 × 53.98 мм (стандартный банковский формат)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="relative py-20 sm:py-28 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Для кого эта карта
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Карта помощи полезна всем, но особенно важна для определенных групп людей
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              { title: 'Люди с хроническими заболеваниями', desc: 'Диабет, эпилепсия, астма и другие состояния', icon: '🩺' },
              { title: 'Пожилые люди', desc: 'Контакты родных, список лекарств для быстрой помощи', icon: '👴' },
              { title: 'Дети и подростки', desc: 'Контакты родителей и базовая медицинская информация', icon: '👶' },
              { title: 'Активные люди', desc: 'Спортсмены, туристы, велосипедисты — все, кто в движении', icon: '🏃' },
              { title: 'Водители', desc: 'В случае ДТП карта поможет быстро связаться с близкими', icon: '🚗' },
              { title: 'Путешественники', desc: 'Важная информация всегда при себе, даже за границей', icon: '✈️' }
            ].map((item, index) => (
              <div 
                key={index}
                className="group bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-200 hover:border-red-400 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-xl sm:text-2xl font-black mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-base sm:text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-pink-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 sm:mb-8">
            Создайте свою карту помощи сегодня
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl mb-10 sm:mb-12 text-red-100 max-w-4xl mx-auto leading-relaxed">
            Это может спасти вашу жизнь или жизнь ваших близких в критической ситуации
          </p>
          <Link 
            href="/auth"
            className="inline-flex items-center gap-3 bg-white text-red-600 px-10 sm:px-12 py-5 sm:py-6 rounded-2xl hover:bg-gray-50 transition-all shadow-2xl hover:shadow-red-500/50 font-black text-lg sm:text-xl transform hover:-translate-y-1 hover:scale-105"
          >
            Начать сейчас
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 sm:p-3 rounded-xl shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white">Карта Помощи</span>
            </div>
            <div className="text-center md:text-right">
              <p className="mb-2 text-base sm:text-lg">© 2025 Карта Помощи. Социальный проект.</p>
              <p className="text-sm sm:text-base">Помогаем спасать жизни через доступ к важной медицинской информации</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
