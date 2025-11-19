# clearPanel AlmaLinux VPS Installation Guide

This guide walks through deploying the `clearPanel-almalinux` stack on a fresh AlmaLinux/CentOS/RHEL VPS. It also explains the optional `install.sh` automation script contained in this repository.

## 1. Server Preparation
- Log in as a sudo-enabled user.
- Update system packages:
  ```bash
  sudo dnf update -y
  ```
- Install base tooling (Git, Node.js, nginx, firewalld):
  ```bash
  sudo dnf install -y git nodejs npm nginx firewalld
  sudo systemctl enable --now firewalld
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --reload
  ```

## 2. Directory Layout & Clone Location
Choose a root directory for the application. The automation scripts expect `/opt/clearpanel`, but you can adjust to your standards.
```bash
sudo mkdir -p /opt/clearpanel
sudo chown $USER:$USER /opt/clearpanel
cd /opt/clearpanel
```
Clone the repository into that directory:
```bash
git clone https://github.com/SefionITServices/clearPanel-almalinux.git
cd clearPanel-almalinux
```

## 3. Manual Installation (Step-by-Step)
1. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. **Environment configuration**
   - Copy `.env.example` to `.env` in each module (`backend`, `frontend`) and set API URLs, credentials, session secrets, and ports.
   - Update JSON data stores in `backend` (`dns.json`, `domains.json`, `server-settings.json`) to match your infrastructure.
3. **Build the bundles**
   ```bash
   cd /opt/clearpanel/clearPanel-almalinux/backend
   npm run build
   cd ../frontend
   npm run build
   ```
   Confirm `backend/dist/` and `frontend/dist/` exist and that `backend/public/assets/` contains the generated asset bundle.
4. **System services**
   - **Backend:** use PM2 or systemd to run `backend/dist/main.js` under a service user.
   - **Frontend:** configure nginx to serve `frontend/dist/` and proxy `/api/` calls to the backend port.
5. **SSL & DNS**
   - Issue TLS certificates via `certbot --nginx` if using nginx.
   - Configure your domain records referencing the VPS IP or the built-in DNS service as outlined in `docs/DNS-SERVER.md`.

## 4. Using the Automation Script (`install.sh`)
The repository ships with `install.sh` at the repo root. It automates the manual steps above for AlmaLinux/CentOS/RHEL 8+/9+ systems.

### 4.1 What the Script Does
- Installs OS prerequisites (enables EPEL, configures NodeSource, installs Node.js 20+, nginx, firewalld).
- Creates `/opt/clearpanel` and a `clearpanel` service user.
- Copies the `backend`, `frontend`, systemd service file, and nginx template into `/opt/clearpanel`.
- Runs `npm install` & `npm run build` for backend and frontend in the context of the `clearpanel` user.
- Generates `backend/.env` with randomized session secrets and default admin credentials (prompting you to change them).
- Configures systemd (`/etc/systemd/system/clearpanel.service`) and nginx (`/etc/nginx/conf.d/clearpanel.conf` or Debian-style locations where present).
- Starts firewalld, enables SSH, starts nginx, and starts the `clearpanel` systemd service.

### 4.2 How to Run It
1. Ensure you cloned the repository under `/opt/clearpanel` (or adjust the script variables accordingly).
2. Run the script as root:
   ```bash
   cd /opt/clearpanel/clearPanel-almalinux
   sudo ./install.sh
   ```
3. Follow the prompts to review/edit the generated `.env` file.
4. Update nginx hostnames and restart services as instructed at the end of the script.

### 4.3 Post-Script Tasks
- Change `ADMIN_USERNAME` and `ADMIN_PASSWORD` inside `/opt/clearpanel/backend/.env`.
- Replace domain placeholders in `/etc/nginx/conf.d/clearpanel.conf` (or `/etc/nginx/sites-available/clearpanel` on Debian-based systems).
- Restart services: `sudo systemctl restart clearpanel nginx`.
- Optionally, issue TLS certificates: `sudo certbot --nginx -d your-domain.com`.

## 5. Maintenance & Updates
- Pull new updates:
  ```bash
  cd /opt/clearpanel/clearPanel-almalinux
  git pull origin main
  npm install
  cd backend && npm install && npm run build
  cd ../frontend && npm install && npm run build
  sudo systemctl restart clearpanel nginx
  ```
- Back up `backend/dns.json`, `backend/domains.json`, and `backend/server-settings.json` regularly.
- Monitor logs: `sudo journalctl -u clearpanel -f` and `sudo tail -f /var/log/nginx/error.log`.

## 6. Reference Material
- `docs/DNS-SERVER.md` – DNS integration specifics.
- `docs/WEB-SERVER.md` – Web server configuration notes.
- `install.sh` – the automated installer discussed above.

Following this document ensures you know exactly where to place the repository, what the automation script covers, and how to perform manual deployments when you need fine-grained control.
