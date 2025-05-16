# School catering administration system

## Introduction

This application was created for my thesis with the aim of simplifying and digitizing the administration of school meal services. It provides a web interface for managing user data, menus, meals and orders.

## Technologies used

- [Next.js](https://nextjs.org/) - Full-stack React framework
- [Prisma](https://www.prisma.io/) - ORM for database access
- [Auth.js](https://authjs.dev/) - Authentication
- [Zod](https://zod.dev/) - Type-safe data validation
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [PostgreSQL](https://www.postgresql.org/) - Relational database

## Installation

To run this application locally, follow these steps:

### Install dependencies

> pnpm install

### Generate prisma client

> pnpx prisma generate

### Run initial database migration

> pnpx prisma migrate dev --name init

### Start development server

> pnpm dev

## License

This project was developed for educational purposes as part of a university thesis. It is not intended for production use and not licensed for commercial deployment