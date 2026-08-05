import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialData = {
  users: [
    {
      id: 'usr_demo',
      email: 'demo@omnidecision.ai',
      name: 'Sarah Jenkins',
      role: 'Chief Strategy Officer',
      // hashed password for 'password123'
      passwordHash: '$2a$10$wT2H0J/7lU60oM63P0kIpeXgXzL9hHw5aN/vTq7D0UuUjL4U5vL2O',
      createdAt: new Date().toISOString()
    }
  ],
  decisions: [
    {
      id: 'dec_enterprise_cloud',
      userId: 'usr_demo',
      title: 'Enterprise AI & Cloud Infrastructure Selection',
      problemStatement: 'Evaluate enterprise-grade cloud AI platforms to migrate our core data pipeline and LLM orchestration workload while balancing monthly compute cost, latency SLAs, compliance (GDPR/SOC2), vendor lock-in, and team ramp-up time.',
      industry: 'Technology & Enterprise SaaS',
      status: 'analyzed',
      criteria: [
        { id: 'crit_cost', name: 'Total Cost of Ownership (TCO)', weight: 0.30, type: 'cost', unit: 'USD/mo' },
        { id: 'crit_latency', name: 'Inference Latency SLA', weight: 0.25, type: 'benefit', unit: 'ms' },
        { id: 'crit_security', name: 'Security & Compliance (SOC2/GDPR)', weight: 0.20, type: 'benefit', unit: 'score 1-10' },
        { id: 'crit_flexibility', name: 'Multi-Model Flexibility & Lock-in Risk', weight: 0.15, type: 'benefit', unit: 'score 1-10' },
        { id: 'crit_rampup', name: 'Dev Team Time-to-Deploy', weight: 0.10, type: 'benefit', unit: 'weeks' }
      ],
      options: [
        {
          id: 'opt_gcp',
          name: 'Google Cloud Platform (Vertex AI + Gemini)',
          description: 'Managed Vertex AI pipelines with native Gemini 1.5 Pro integration and TPU v5e acceleration.',
          scores: {
            crit_cost: 7.5,
            crit_latency: 9.2,
            crit_security: 9.0,
            crit_flexibility: 8.5,
            crit_rampup: 9.0
          },
          risks: ['Minor vendor lock-in to GCP ecosystem', 'Data egress pricing spikes if multi-cloud fallback needed']
        },
        {
          id: 'opt_aws',
          name: 'Amazon Web Services (Bedrock + SageMaker)',
          description: 'AWS Bedrock unified API with Claude 3.5 Sonnet and Llama 3 models hosted on AWS Graviton.',
          scores: {
            crit_cost: 6.8,
            crit_latency: 8.5,
            crit_security: 9.5,
            crit_flexibility: 8.0,
            crit_rampup: 7.5
          },
          risks: ['SageMaker endpoints require complex custom autoscaling setup', 'Bedrock rate limits during peak US hours']
        },
        {
          id: 'opt_selfhost',
          name: 'Self-Hosted Hybrid (vLLM on Kubernetes + Bare Metal GPUs)',
          description: 'Open-source models (Llama-3 70B, DeepSeek) deployed on dedicated RunPod GPU instances with Kubernetes.',
          scores: {
            crit_cost: 9.0,
            crit_latency: 7.0,
            crit_security: 7.0,
            crit_flexibility: 9.5,
            crit_rampup: 4.0
          },
          risks: ['High engineering maintenance overhead', 'No SLA guarantee from hardware providers', 'Kubeflow complexity']
        }
      ],
      scenarioModifiers: {
        marketDownturn: false,
        costInflationPercent: 0,
        stringentCompliance: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  auditLogs: []
};

class Database {
  constructor() {
    this.data = initialData;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error reading db.json, using fallback:', err);
      this.data = initialData;
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing db.json:', err);
    }
  }

  // Users CRUD
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Decisions CRUD
  getDecisions(userId) {
    return this.data.decisions.filter(d => d.userId === userId);
  }

  getDecisionById(id) {
    return this.data.decisions.find(d => d.id === id);
  }

  createDecision(decision) {
    this.data.decisions.unshift(decision);
    this.save();
    return decision;
  }

  updateDecision(id, updateData) {
    const index = this.data.decisions.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.data.decisions[index] = {
      ...this.data.decisions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.decisions[index];
  }

  deleteDecision(id) {
    const index = this.data.decisions.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.data.decisions.splice(index, 1);
    this.save();
    return true;
  }

  // Audit Logs
  addAuditLog(log) {
    this.data.auditLogs.unshift({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      ...log
    });
    this.save();
  }
}

export const db = new Database();
