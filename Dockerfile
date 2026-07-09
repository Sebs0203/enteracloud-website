# Enteracloud Website — static site (nginx:alpine)
# No build step, no Node, no SMTP. Pure static HTML/CSS/JS.
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
