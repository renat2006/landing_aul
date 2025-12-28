# IT-AUL Landing

Лендинг команды разработчиков IT-AUL.

## Установка

```bash
npm install
```

## Запуск

```bash
# Dev-сервер
npm run dev

# Продакшн сборка
npm run build

# Предпросмотр сборки
npm run build:preview
```

## Структура

```
src/
├── index.html          # HTML
├── styles.css          # Основные стили
├── pixel-icons.css     # Пиксельные иконки
├── script.js           # JS логика
├── data.json           # Контент (команда, услуги, достижения)
└── assets/             # Изображения и иконки
```

## Контент

Редактирование данных в `src/data.json`:
- `team` - информация о команде
- `team_members` - участники
- `services` - услуги
- `achievements` - достижения
- `contact` - контакты

SEO мета-теги в `<head>` секции `src/index.html`.

## Docker

### Production

```bash
# Сборка образа
docker build -t it-aul-landing .

# Запуск контейнера
docker run -d -p 80:3000 --name landing it-aul-landing

# Или через docker-compose
docker-compose up -d
```

### Development

```bash
# Запуск dev-сервера в Docker
docker build -f Dockerfile.dev -t it-aul-landing:dev .
docker run -p 3000:3000 -v $(pwd):/app it-aul-landing:dev
```

### Остановка

```bash
docker-compose down
# или
docker stop landing && docker rm landing
```

## Деплой

Проект настроен для Netlify. Автоматический деплой при push в основную ветку.

Настройки в `netlify.toml`:
- Build: `npm run build`
- Publish: `dist`

## Технологии

- HTML/CSS/JS
- Webpack
- Docker / Nginx
- Netlify для деплоя
