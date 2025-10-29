#!/bin/bash

# Script para levantar Frontend y Backend simultáneamente
# Uso: ./start-dev.sh

echo "🚀 Iniciando Kampus (Frontend + Backend)"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si node_modules existe en backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
fi

# Verificar si node_modules existe en raíz (frontend)
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install
fi

# Verificar si existe .env en backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No se encontró backend/.env"
    echo "📝 Crea el archivo desde .env.example:"
    echo "   cd backend && cp .env.example .env"
    echo ""
fi

echo "${GREEN}✅ Dependencias verificadas${NC}"
echo ""
echo "${BLUE}Terminal 1: Backend${NC}"
echo "   cd backend && npm run dev"
echo ""
echo "${BLUE}Terminal 2: Frontend${NC}"
echo "   npm run dev"
echo ""
echo "O ejecuta ambos con: npm run dev:all"
echo ""


