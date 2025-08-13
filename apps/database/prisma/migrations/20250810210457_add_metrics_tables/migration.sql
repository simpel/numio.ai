-- CreateTable
CREATE TABLE "MetricEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricSnapshot" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "context" JSONB DEFAULT '{}',
    "date" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,

    CONSTRAINT "MetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetricEvent_type_timestamp_idx" ON "MetricEvent"("type", "timestamp");

-- CreateIndex
CREATE INDEX "MetricEvent_timestamp_idx" ON "MetricEvent"("timestamp");

-- CreateIndex
CREATE INDEX "MetricEvent_entityId_idx" ON "MetricEvent"("entityId");

-- CreateIndex
CREATE INDEX "MetricSnapshot_metric_date_idx" ON "MetricSnapshot"("metric", "date");

-- CreateIndex
CREATE INDEX "MetricSnapshot_context_idx" ON "MetricSnapshot"("context");

-- CreateIndex
CREATE UNIQUE INDEX "MetricSnapshot_metric_context_date_period_key" ON "MetricSnapshot"("metric", "context", "date", "period");
