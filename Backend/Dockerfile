FROM python:3.10-slim

WORKDIR /SmatalBot

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . /SmatalBot

EXPOSE 8080

CMD ["gunicorn","--bind","0.0.0.0:8080","main:app"]