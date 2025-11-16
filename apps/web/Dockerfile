# Usa a imagem Nginx oficial
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos do PWA (HTML, CSS, JS, etc.)
# A pasta 'public' do seu projeto será a raiz do Nginx
COPY ./public/ /usr/share/nginx/html

# Expõe a porta 80 (padrão do Nginx)
EXPOSE 80

# O comando padrão do Nginx (CMD) já é "nginx -g 'daemon off;'"