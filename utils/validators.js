const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Valida formato de e-mail
 */
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Valida telefones brasileiros
 */
const validatePhone = (phone) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

/**
 * Valida CPF
 */
const validateCPF = (cpf) => {
  if (!cpf) return false;
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0, rev;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

/**
 * Valida CNPJ
 */
const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

/**
 * Valida CEP
 */
const validateCEP = (cep) => {
  if (!cep) return false;
  return /^[0-9]{5}-?[0-9]{3}$/.test(cep);
};

/**
 * Valida dados de orçamento
 */
const validateBudgetData = (data) => {
  const errors = [];
  if (!data.clientName) errors.push('Nome do cliente é obrigatório');
  if (!data.clientEmail) {
    errors.push('E-mail do cliente é obrigatório');
  } else if (!validateEmail(data.clientEmail)) {
    errors.push('E-mail do cliente é inválido');
  }
  if (!data.clientPhone) errors.push('Telefone do cliente é obrigatório');
  
  if (data.quantity !== undefined && data.quantity <= 0) {
    errors.push('Quantidade deve ser maior que 0');
  }
  if (data.infill !== undefined && (data.infill < 0 || data.infill > 100)) {
    errors.push('Infill deve estar entre 0 e 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida dados de usuário
 */
const validateUserData = (data) => {
  const errors = [];
  if (!data.name) errors.push('Nome é obrigatório');
  if (!data.email) {
    errors.push('E-mail é obrigatório');
  } else if (!validateEmail(data.email)) {
    errors.push('E-mail é inválido');
  }
  if (!data.password) {
    errors.push('Senha é obrigatória');
  } else if (data.password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  
  const allowedRoles = ['admin', 'client', 'user'];
  if (data.role && !allowedRoles.includes(data.role)) {
    errors.push('Role inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitiza entrada de texto
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '$1')
    .replace(/<[^>]+>/gm, '')
    .trim();
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value).replace(/\s/, ' ');
};

const formatPhone = (phone) => {
  if (!phone) return '';
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
};

const formatCEP = (cep) => {
  if (!cep) return '';
  const d = cep.replace(/\D/g, '');
  if (d.length === 8) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return cep;
};

const formatCPF = (cpf) => {
  if (!cpf) return '';
  const d = cpf.replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  return cpf;
};

const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  const d = cnpj.replace(/\D/g, '');
  if (d.length === 14) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  return cnpj;
};

const parseDimensions = (dim) => {
  if (!dim || typeof dim !== 'string') return null;
  const parts = dim.toLowerCase().split('x').map(p => parseFloat(p.trim()));
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { length: parts[0], width: parts[1], height: parts[2] };
};

const calculateVolume = (l, w, h) => {
  if (l <= 0 || w <= 0 || h <= 0) return 0;
  return l * w * h;
};

const calculatePrintTime = (volume, quality) => {
  if (volume <= 0) return 0;
  let factor = quality === 'alta' ? 0.06 : quality === 'média' ? 0.04 : 0.02;
  return volume * factor;
};

const calculateMaterialCost = (volume, density, pricePerKg, infill = 100) => {
  const weightGrams = (volume / 1000) * density * (infill / 100);
  return (weightGrams / 1000) * pricePerKg;
};

const generateTrackingCode = (prefix = 'BUDGET') => {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${rand}`;
};

const slugify = (text) => {
  if (!text) return '';
  return text.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-');
};

const truncateText = (text, limit) => {
  if (!text || text.length <= limit) return text;
  return text.slice(0, Math.max(0, limit - 3)) + '...';
};

const stripHTML = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

const isValidImageFile = (filename) => {
  if (!filename) return false;
  return /\.(jpg|jpeg|png|gif)$/i.test(filename);
};

const isValidDocumentFile = (filename) => {
  if (!filename) return false;
  return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(filename);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateRandomString = (length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const createJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

const verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
};

module.exports = {
  validateEmail, validatePhone, validateCPF, validateCNPJ, validateCEP, validateBudgetData, validateUserData,
  sanitizeInput, formatCurrency, formatPhone, formatCEP, formatCPF, formatCNPJ,
  parseDimensions, calculateVolume, calculatePrintTime, calculateMaterialCost,
  generateTrackingCode, slugify, truncateText, stripHTML,
  isValidImageFile, isValidDocumentFile, formatFileSize, generateRandomString,
  hashPassword, comparePassword, createJWT, verifyJWT
};
