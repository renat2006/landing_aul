# IT-AUL Landing - Build System

Этот проект использует современную систему сборки на основе Webpack для оптимизации производительности и улучшения user experience.

## 🚀 Возможности системы сборки

### Оптимизация кода
- **JavaScript**: Минификация с Terser, удаление console.log в продакшн
- **CSS**: Минификация, автопрефиксы, современные CSS features
- **HTML**: Минификация, инлайн критических стилей

### Оптимизация изображений
- **Автоматическое сжатие** PNG, JPEG, GIF, SVG
- **Конвертация в WebP** для современных браузеров
- **Responsive images** с разными размерами
- **Lazy loading** для улучшения загрузки

### Performance оптимизации
- **Code splitting** - разделение кода на chunks
- **Tree shaking** - удаление неиспользуемого кода
- **Bundle analysis** - анализ размера бандла
- **Кэширование** с content hash

### Development Experience
- **Hot Module Replacement** (HMR)
- **Source maps** для отладки
- **Dev server** с live reload
- **CSS загружается в процессе разработки**

## 📦 Команды для работы

### Установка зависимостей
```bash
npm install
```

### Разработка
```bash
npm run dev
```
- Запускает dev server на http://localhost:3000
- Включает HMR и live reload
- Source maps для отладки

### Продакшн сборка
```bash
npm run build
```
- Минификация всех ресурсов
- Оптимизация изображений
- Генерация WebP версий
- Content hash для кэширования

### Анализ бандла
```bash
npm run build:analyze
```
- Анализ размера файлов
- Визуализация dependencies
- Оптимизация рекомендации

### Предпросмотр продакшн сборки
```bash
npm run serve
```
- Локальный сервер для тестирования продакшн версии

### Очистка build файлов
```bash
npm run clean
```

## 📁 Структура проекта

```
/
├── src/                    # Исходные файлы
│   ├── index.html         # HTML шаблон
│   ├── styles.css         # Основные стили
│   ├── script.js          # JavaScript код
│   ├── data.json          # Данные контента
│   └── assets/            # Ресурсы
│       └── images/        # Изображения
├── dist/                  # Собранные файлы (auto-generated)
├── webpack.config.js      # Конфигурация Webpack
├── package.json           # Зависимости и скрипты
└── README.md             # Документация проекта
```

## ⚡ Performance результаты

После внедрения системы сборки ожидаемые улучшения:

- **Lighthouse Performance**: 90-100 баллов
- **Размер бандла**: Уменьшение на 60-80%
- **Время загрузки**: Улучшение на 40-60%
- **WebP изображения**: Уменьшение размера на 25-35%

## 🔧 Настройки Webpack

### Основные плагины
- `HtmlWebpackPlugin` - обработка HTML
- `MiniCssExtractPlugin` - извлечение CSS
- `ImageminPlugin` - оптимизация изображений
- `TerserPlugin` - минификация JS
- `CssMinimizerPlugin` - минификация CSS

### Лоадеры
- `babel-loader` - транспиляция ES6+
- `css-loader` + `postcss-loader` - обработка CSS
- `file-loader` - обработка файлов
- `html-loader` - обработка HTML

## 🌐 Browser Support

Поддерживаемые браузеры:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 📊 Monitoring

Для мониторинга производительности рекомендуется:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
- Chrome DevTools Lighthouse 