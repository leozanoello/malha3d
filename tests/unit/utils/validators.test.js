/**
 * Testes unitários para validações e utilitários
 */

const {
  validateEmail,
  validatePhone,
  validateCPF,
  validateCNPJ,
  validateCEP,
  validateBudgetData,
  validateUserData,
  sanitizeInput,
  formatCurrency,
  formatPhone,
  formatCEP,
  formatCPF,
  formatCNPJ,
  parseDimensions,
  calculateVolume,
  calculatePrintTime,
  calculateMaterialCost,
  generateTrackingCode,
  slugify,
  truncateText,
  stripHTML,
  isValidImageFile,
  isValidDocumentFile,
  formatFileSize,
  generateRandomString,
  hashPassword,
  comparePassword,
  createJWT,
  verifyJWT
} = require('../../../utils/validators');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock das dependências
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Validações e Utilitários', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('validateEmail', () => {

    test('deve validar e-mails corretos', () => {
      expect(validateEmail('teste@teste.com')).toBe(true);
      expect(validateEmail('usuario.nome@empresa.com.br')).toBe(true);
      expect(validateEmail('teste+tag@gmail.com')).toBe(true);
      expect(validateEmail('teste_123@sub-dominio.com')).toBe(true);
    });

    test('deve rejeitar e-mails inválidos', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('teste')).toBe(false);
      expect(validateEmail('teste@')).toBe(false);
      expect(validateEmail('@teste.com')).toBe(false);
      expect(validateEmail('teste@teste')).toBe(false);
      expect(validateEmail('teste@.com')).toBe(false);
      expect(validateEmail('teste@teste.')).toBe(false);
    });

  });

  describe('validatePhone', () => {

    test('deve validar telefones brasileiros', () => {
      expect(validatePhone('11999999999')).toBe(true);
      expect(validatePhone('1199999-9999')).toBe(true);
      expect(validatePhone('(11) 99999-9999')).toBe(true);
      expect(validatePhone('(11) 9999-9999')).toBe(true);
      expect(validatePhone('11 99999-9999')).toBe(true);
    });

    test('deve rejeitar telefones inválidos', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('123456789012345')).toBe(false);
      expect(validatePhone('abcdefghij')).toBe(false);
      expect(validatePhone('11 9999')).toBe(false);
    });

  });

  describe('validateCPF', () => {

    test('deve validar CPFs válidos', () => {
      expect(validateCPF('123.456.789-09')).toBe(true);
      expect(validateCPF('12345678909')).toBe(true);
      expect(validateCPF('987.654.321-00')).toBe(true);
    });

    test('deve rejeitar CPFs inválidos', () => {
      expect(validateCPF('')).toBe(false);
      expect(validateCPF('123.456.789-00')).toBe(false); // Dígito verificador inválido
      expect(validateCPF('111.111.111-11')).toBe(false); // CPF com dígitos repetidos
      expect(validateCPF('123.456.789')).toBe(false); // CPF incompleto
      expect(validateCPF('abcdefghijk')).toBe(false); // CPF com letras
    });

  });

  describe('validateCNPJ', () => {

    test('deve validar CNPJs válidos', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      expect(validateCNPJ('11222333000181')).toBe(true);
      expect(validateCNPJ('00.000.000/0001-91')).toBe(true);
    });

    test('deve rejeitar CNPJs inválidos', () => {
      expect(validateCNPJ('')).toBe(false);
      expect(validateCNPJ('11.222.333/0001-82')).toBe(false); // Dígito verificador inválido
      expect(validateCNPJ('11.111.111/1111-11')).toBe(false); // CNPJ com dígitos repetidos
      expect(validateCNPJ('11.222.333/0001')).toBe(false); // CNPJ incompleto
      expect(validateCNPJ('abcdefghijklmn')).toBe(false); // CNPJ com letras
    });

  });

  describe('validateCEP', () => {

    test('deve validar CEPs válidos', () => {
      expect(validateCEP('12345-678')).toBe(true);
      expect(validateCEP('12345678')).toBe(true);
      expect(validateCEP('01000-000')).toBe(true);
    });

    test('deve rejeitar CEPs inválidos', () => {
      expect(validateCEP('')).toBe(false);
      expect(validateCEP('12345')).toBe(false);
      expect(validateCEP('123456789')).toBe(false);
      expect(validateCEP('12345-67')).toBe(false);
      expect(validateCEP('abcdefgh')).toBe(false);
    });

  });

  describe('validateBudgetData', () => {

    test('deve validar dados completos de orçamento', () => {
      const validBudget = {
        clientName: 'João Silva',
        clientEmail: 'joao@teste.com',
        clientPhone: '11999999999',
        projectType: 'peça-funcional',
        description: 'Peça para automação',
        dimensions: '10x10x5',
        quantity: 1,
        material: 'PLA',
        color: 'Branco',
        quality: 'alta',
        infill: 20,
        deadline: '2024-12-31',
        priority: 'normal'
      };

      const result = validateBudgetData(validBudget);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve detectar campos obrigatórios faltantes', () => {
      const invalidBudget = {
        clientName: '',
        clientEmail: '',
        clientPhone: ''
      };

      const result = validateBudgetData(invalidBudget);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome do cliente é obrigatório');
      expect(result.errors).toContain('E-mail do cliente é obrigatório');
      expect(result.errors).toContain('Telefone do cliente é obrigatório');
    });

    test('deve validar formato de e-mail', () => {
      const invalidBudget = {
        clientName: 'João Silva',
        clientEmail: 'email_invalido',
        clientPhone: '11999999999',
        projectType: 'peça-funcional',
        description: 'Peça de teste'
      };

      const result = validateBudgetData(invalidBudget);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('E-mail do cliente é inválido');
    });

    test('deve validar valores numéricos', () => {
      const invalidBudget = {
        clientName: 'João Silva',
        clientEmail: 'joao@teste.com',
        clientPhone: '11999999999',
        projectType: 'peça-funcional',
        description: 'Peça de teste',
        quantity: -1,
        infill: 150
      };

      const result = validateBudgetData(invalidBudget);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Quantidade deve ser maior que 0');
      expect(result.errors).toContain('Infill deve estar entre 0 e 100');
    });

  });

  describe('validateUserData', () => {

    test('deve validar dados completos de usuário', () => {
      const validUser = {
        name: 'Maria Santos',
        email: 'maria@teste.com',
        password: 'senha123',
        phone: '11999999999',
        role: 'client'
      };

      const result = validateUserData(validUser);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve detectar campos obrigatórios faltantes', () => {
      const invalidUser = {
        name: '',
        email: '',
        password: ''
      };

      const result = validateUserData(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome é obrigatório');
      expect(result.errors).toContain('E-mail é obrigatório');
      expect(result.errors).toContain('Senha é obrigatória');
    });

    test('deve validar força da senha', () => {
      const weakPasswordUser = {
        name: 'Pedro Oliveira',
        email: 'pedro@teste.com',
        password: '123',
        phone: '11999999999'
      };

      const result = validateUserData(weakPasswordUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve ter pelo menos 6 caracteres');
    });

    test('deve validar roles permitidos', () => {
      const invalidRoleUser = {
        name: 'Ana Costa',
        email: 'ana@teste.com',
        password: 'senha123',
        role: 'invalid_role'
      };

      const result = validateUserData(invalidRoleUser);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Role inválido');
    });

  });

  describe('sanitizeInput', () => {

    test('deve sanitizar strings perigosas', () => {
      expect(sanitizeInput('<script>alert("XSS")</script>')).toBe('alert(\"XSS\")');
      expect(sanitizeInput('Texto <b>com</b> HTML')).toBe('Texto com HTML');
      expect(sanitizeInput('Texto normal')).toBe('Texto normal');
    });

    test('deve limpar espaços em branco', () => {
      expect(sanitizeInput('  texto com espaços  ')).toBe('texto com espaços');
      expect(sanitizeInput('\n\n texto com quebras \n\n')).toBe('texto com quebras');
    });

    test('deve retornar string vazia para entrada inválida', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
    });

  });

  describe('Formatadores', () => {

    test('formatCurrency deve formatar valores monetários', () => {
      expect(formatCurrency(100)).toBe('R$ 100,00');
      expect(formatCurrency(150.50)).toBe('R$ 150,50');
      expect(formatCurrency(1000)).toBe('R$ 1.000,00');
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    test('formatPhone deve formatar telefones', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
      expect(formatPhone('1199999999')).toBe('(11) 9999-9999');
      expect(formatPhone('')).toBe('');
    });

    test('formatCEP deve formatar CEPs', () => {
      expect(formatCEP('12345678')).toBe('12345-678');
      expect(formatCEP('12345-678')).toBe('12345-678');
      expect(formatCEP('')).toBe('');
    });

    test('formatCPF deve formatar CPFs', () => {
      expect(formatCPF('12345678909')).toBe('123.456.789-09');
      expect(formatCPF('123.456.789-09')).toBe('123.456.789-09');
      expect(formatCPF('')).toBe('');
    });

    test('formatCNPJ deve formatar CNPJs', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
      expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81');
      expect(formatCNPJ('')).toBe('');
    });

  });

  describe('parseDimensions', () => {

    test('deve analisar dimensões válidas', () => {
      expect(parseDimensions('10x20x5')).toEqual({ length: 10, width: 20, height: 5 });
      expect(parseDimensions('10.5x20.3x5.2')).toEqual({ length: 10.5, width: 20.3, height: 5.2 });
      expect(parseDimensions('100x200x50')).toEqual({ length: 100, width: 200, height: 50 });
    });

    test('deve retornar null para dimensões inválidas', () => {
      expect(parseDimensions('')).toBeNull();
      expect(parseDimensions('invalid')).toBeNull();
      expect(parseDimensions('10x20')).toBeNull();
      expect(parseDimensions('10x20x5x3')).toBeNull();
      expect(parseDimensions('axbxc')).toBeNull();
    });

  });

  describe('calculateVolume', () => {

    test('deve calcular volume corretamente', () => {
      expect(calculateVolume(10, 20, 5)).toBe(1000);
      expect(calculateVolume(1, 1, 1)).toBe(1);
      expect(calculateVolume(10.5, 20.3, 5.2)).toBeCloseTo(1108.38, 2);
    });

    test('deve retornar 0 para dimensões inválidas', () => {
      expect(calculateVolume(0, 20, 5)).toBe(0);
      expect(calculateVolume(10, -5, 5)).toBe(0);
      expect(calculateVolume(10, 20, 0)).toBe(0);
    });

  });

  describe('calculatePrintTime', () => {

    test('deve estimar tempo de impressão', () => {
      // Tempo base: 1h para volume de 1000mm³ com qualidade alta
      expect(calculatePrintTime(1000, 'alta')).toBeGreaterThan(0);
      expect(calculatePrintTime(2000, 'alta')).toBeGreaterThan(calculatePrintTime(1000, 'alta'));

      // Qualidade média deve ser mais rápida que alta
      expect(calculatePrintTime(1000, 'média')).toBeLessThan(calculatePrintTime(1000, 'alta'));

      // Qualidade baixa deve ser mais rápida que média
      expect(calculatePrintTime(1000, 'baixa')).toBeLessThan(calculatePrintTime(1000, 'média'));
    });

    test('deve retornar valor padrão para parâmetros inválidos', () => {
      expect(calculatePrintTime(0, 'alta')).toBe(0);
      expect(calculatePrintTime(1000, 'invalid')).toBeGreaterThan(0);
    });

  });

  describe('calculateMaterialCost', () => {

    test('deve calcular custo do material', () => {
      // Volume em mm³, densidade em g/cm³, preço por kg
      const volume = 1000; // mm³
      const density = 1.24; // PLA: 1.24 g/cm³
      const pricePerKg = 80; // R$ 80/kg

      const cost = calculateMaterialCost(volume, density, pricePerKg);
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(1); // Para 1cm³, custo deve ser menor que R$ 1
    });

    test('deve considerar infill no cálculo', () => {
      const volume = 10000; // mm³
      const density = 1.24;
      const pricePerKg = 80;

      const cost100 = calculateMaterialCost(volume, density, pricePerKg, 100);
      const cost50 = calculateMaterialCost(volume, density, pricePerKg, 50);
      const cost20 = calculateMaterialCost(volume, density, pricePerKg, 20);

      expect(cost50).toBeLessThan(cost100);
      expect(cost20).toBeLessThan(cost50);
    });

  });

  describe('generateTrackingCode', () => {

    test('deve gerar códigos de rastreamento únicos', () => {
      const code1 = generateTrackingCode();
      const code2 = generateTrackingCode();
      const code3 = generateTrackingCode();

      expect(code1).toMatch(/^BUDGET-\d{6}$/);
      expect(code2).toMatch(/^BUDGET-\d{6}$/);
      expect(code3).toMatch(/^BUDGET-\d{6}$/);

      // Códigos devem ser diferentes (probabilidade muito baixa de serem iguais)
      expect(code1).not.toBe(code2);
      expect(code2).not.toBe(code3);
    });

    test('deve aceitar prefixo customizado', () => {
      const code = generateTrackingCode('ORDER');
      expect(code).toMatch(/^ORDER-\d{6}$/);
    });

  });

  describe('slugify', () => {

    test('deve converter texto para slug', () => {
      expect(slugify('Peça Funcional')).toBe('peca-funcional');
      expect(slugify('Protótipo Industrial')).toBe('prototipo-industrial');
      expect(slugify('Arte & Decoração')).toBe('arte-decoracao');
      expect(slugify('  Espaços  Desnecessários  ')).toBe('espacos-desnecessarios');
    });

    test('deve lidar com caracteres especiais', () => {
      expect(slugify('Peça @#$% Funcional')).toBe('peca-funcional');
      expect(slugify('123 Produto 456')).toBe('123-produto-456');
      expect(slugify('')).toBe('');
    });

  });

  describe('truncateText', () => {

    test('deve truncar texto longo', () => {
      const longText = 'Este é um texto muito longo que precisa ser truncado para caber em um espaço limitado';
      const truncated = truncateText(longText, 30);

      expect(truncated.length).toBeLessThanOrEqual(33); // 30 + '...'
      expect(truncated).toMatch(/\.{3}$/); // Deve terminar com '...'
    });

    test('não deve truncar texto curto', () => {
      const shortText = 'Texto curto';
      const truncated = truncateText(shortText, 50);

      expect(truncated).toBe(shortText);
    });

    test('deve respeitar limite mínimo', () => {
      const text = 'Texto de teste';
      const truncated = truncateText(text, 5);

      expect(truncated).toBe('Te...');
    });

  });

  describe('stripHTML', () => {

    test('deve remover tags HTML', () => {
      expect(stripHTML('<p>Texto com <strong>HTML</strong></p>')).toBe('Texto com HTML');
      expect(stripHTML('<div>Outro <span>exemplo</span></div>')).toBe('Outro exemplo');
      expect(stripHTML('Texto sem HTML')).toBe('Texto sem HTML');
    });

    test('deve remover atributos e tags vazias', () => {
      expect(stripHTML('<p class="test">Texto</p>')).toBe('Texto');
      expect(stripHTML('<p></p>')).toBe('');
      expect(stripHTML('')).toBe('');
    });

  });

  describe('Validações de Arquivo', () => {

    test('isValidImageFile deve validar extensões de imagem', () => {
      expect(isValidImageFile('foto.jpg')).toBe(true);
      expect(isValidImageFile('imagem.png')).toBe(true);
      expect(isValidImageFile('desenho.jpeg')).toBe(true);
      expect(isValidImageFile('figura.gif')).toBe(true);
      expect(isValidImageFile('arquivo.pdf')).toBe(false);
      expect(isValidImageFile('')).toBe(false);
    });

    test('isValidDocumentFile deve validar extensões de documento', () => {
      expect(isValidDocumentFile('documento.pdf')).toBe(true);
      expect(isValidDocumentFile('planilha.xlsx')).toBe(true);
      expect(isValidDocumentFile('texto.doc')).toBe(true);
      expect(isValidDocumentFile('apresentacao.pptx')).toBe(true);
      expect(isValidDocumentFile('imagem.jpg')).toBe(false);
      expect(isValidDocumentFile('')).toBe(false);
    });

    test('formatFileSize deve formatar tamanhos de arquivo', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

  });

  describe('generateRandomString', () => {

    test('deve gerar strings aleatórias', () => {
      const str1 = generateRandomString(10);
      const str2 = generateRandomString(10);

      expect(str1).toHaveLength(10);
      expect(str2).toHaveLength(10);
      expect(str1).not.toBe(str2); // Muito improvável serem iguais
    });

    test('deve usar caracteres especificados', () => {
      const str = generateRandomString(20, 'ABC123');
      expect(str).toMatch(/^[ABC123]{20}$/);
    });

  });

  describe('Funções de Criptografia', () => {

    beforeEach(() => {
      // Mock do bcrypt
      bcrypt.hash.mockResolvedValue('hashed-password');
      bcrypt.compare.mockResolvedValue(true);

      // Mock do JWT
      jwt.sign.mockReturnValue('test-token');
      jwt.verify.mockReturnValue({ userId: 1, email: 'teste@teste.com' });
    });

    test('hashPassword deve gerar hash da senha', async () => {
      const result = await hashPassword('minha-senha');

      expect(bcrypt.hash).toHaveBeenCalledWith('minha-senha', 10);
      expect(result).toBe('hashed-password');
    });

    test('comparePassword deve comparar senhas', async () => {
      const result = await comparePassword('minha-senha', 'hashed-password');

      expect(bcrypt.compare).toHaveBeenCalledWith('minha-senha', 'hashed-password');
      expect(result).toBe(true);
    });

    test('createJWT deve criar token JWT', () => {
      const payload = { userId: 1, email: 'teste@teste.com' };
      const result = createJWT(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, 'test-secret', { expiresIn: '7d' });
      expect(result).toBe('test-token');
    });

    test('verifyJWT deve verificar token JWT', () => {
      const result = verifyJWT('test-token');

      expect(jwt.verify).toHaveBeenCalledWith('test-token', 'test-secret');
      expect(result).toEqual({ userId: 1, email: 'teste@teste.com' });
    });

  });

});
