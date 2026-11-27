#!/usr/bin/env bash
# Prepara una VM Ubuntu 24.04 de Oracle para el backend. Se corre una sola vez, como ubuntu:
#   ssh ubuntu@IP "bash -s -- '$(cat llave_ci.pub)'" < deploy/preparar-vm.sh
# (ssh une los argumentos en un solo texto: sin las comillas simples la llave llega partida)
# Deja Docker, el firewall abierto en 80/443, el usuario deploy y el repo en /opt/memoria-digital.
set -euo pipefail

LLAVE_CI="${1:?pasa la llave pública con la que entra el CI}"
REPO=https://github.com/suscantillo/memoria-digital-atlantico.git
CARPETA=/opt/memoria-digital

# antes de instalar Docker, para no guardar sus reglas junto con estas
echo ">> Firewall: las imágenes de Oracle rechazan todo salvo SSH"
for puerto in 80 443; do
  if ! sudo iptables -C INPUT -p tcp --dport "$puerto" -m conntrack --ctstate NEW -j ACCEPT 2>/dev/null; then
    sudo iptables -I INPUT -p tcp --dport "$puerto" -m conntrack --ctstate NEW -j ACCEPT
  fi
done
sudo netfilter-persistent save

echo ">> Docker desde su repositorio oficial (trae compose v2 en cualquier Ubuntu)"
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" |
  sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker

echo ">> Usuario deploy, el único que usa el CI"
if ! id deploy >/dev/null 2>&1; then
  sudo useradd --create-home --shell /bin/bash deploy
fi
sudo usermod -aG docker deploy
sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
echo "$LLAVE_CI" | sudo tee /home/deploy/.ssh/authorized_keys >/dev/null
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys

echo ">> Repositorio en $CARPETA"
if [ ! -d "$CARPETA/.git" ]; then
  sudo git clone -q "$REPO" "$CARPETA"
fi
sudo chown -R deploy:deploy "$CARPETA"

echo ">> Respaldo diario de la base a las 3:00"
sudo install -d -o deploy -g deploy /home/deploy/respaldos
echo "0 3 * * * $CARPETA/deploy/respaldar-db.sh >> /home/deploy/respaldos/respaldo.log 2>&1" |
  sudo crontab -u deploy -

echo
echo "Listo. Falta crear $CARPETA/deploy/.env a partir de deploy/.env.example y correr:"
echo "  sudo -u deploy $CARPETA/deploy/actualizar.sh"
