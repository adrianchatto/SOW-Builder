FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV SOW_BUILDER_HOST=0.0.0.0
ENV SOW_BUILDER_PORT=5173
ENV SOW_BUILDER_DB=/data/sow_builder.db

EXPOSE 5173

CMD ["python", "server.py"]
