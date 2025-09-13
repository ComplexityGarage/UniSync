# UniSync web platform

## Getting Started

1. Create and edit

`cp .env.example .env`

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Run on Raspberry Pi 5

1. Install Ubuntu Server LTS (use Raspberry Pi Imager and configure SSH)

2. Install Docker 
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

3. `git clone https://github.com/ComplexityGarage/NameOfTheProject1.git`

4. `cd NameOfTheProject1/web`

5. Create and edit .env file

`cp .env.example .env`

6. `docker compose up -d`