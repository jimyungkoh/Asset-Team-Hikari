# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-25
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system build dependencies required by scientific packages.
RUN apt-get update \
    && apt-get install --no-install-recommends -y build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

ENV PYTHONPATH=/app
EXPOSE 8000

CMD ["uvicorn", "tradingagents.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
