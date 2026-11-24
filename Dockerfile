# Enteracloud Website — static site (nginx:alpine)
# No build step, no Node, no SMTP. Pure static HTML/CSS/JS.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/Dockerfile
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
