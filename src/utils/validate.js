// 邮箱验证
export const validateEmail = (rule, value, callback) => {
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) {
      callback(new Error('请输入邮箱地址'))
    } else if (!emailReg.test(value)) {
      callback(new Error('请输入正确的邮箱格式'))
    } else {
      callback()
    }
  }
  
  // 手机号验证
  export const validatePhone = (rule, value, callback) => {
    const phoneReg = /^1[3-9]\d{9}$/
    if (!value) {
      callback(new Error('请输入手机号码'))
    } else if (!phoneReg.test(value)) {
      callback(new Error('请输入正确的手机号码'))
    } else {
      callback()
    }
  }
  
  // 公司名称验证
  export const validateCompanyName = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入公司名称'))
    } else if (value.length < 2) {
      callback(new Error('公司名称至少2个字符'))
    } else if (value.length > 100) {
      callback(new Error('公司名称不能超过100个字符'))
    } else {
      callback()
    }
  }
  
  // 英文名称验证
  export const validateEnglishName = (rule, value, callback) => {
    const englishReg = /^[a-zA-Z\s.,&()-]+$/
    if (!value) {
      callback(new Error('请输入英文名称'))
    } else if (!englishReg.test(value)) {
      callback(new Error('英文名称只能包含英文字母、空格和常用标点符号'))
    } else if (value.length > 200) {
      callback(new Error('英文名称不能超过200个字符'))
    } else {
      callback()
    }
  }
  
  // 联系人姓名验证
  export const validateContactName = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入联系人姓名'))
    } else if (value.length < 2) {
      callback(new Error('联系人姓名至少2个字符'))
    } else if (value.length > 20) {
      callback(new Error('联系人姓名不能超过20个字符'))
    } else {
      callback()
    }
  }
  
  // 地址验证
  export const validateAddress = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入公司地址'))
    } else if (value.length < 5) {
      callback(new Error('请输入完整的公司地址'))
    } else if (value.length > 200) {
      callback(new Error('公司地址不能超过200个字符'))
    } else {
      callback()
    }
  }
  
  // 公司简介验证
  export const validateCompanyIntro = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请输入公司简介'))
    } else if (value.length < 10) {
      callback(new Error('公司简介至少10个字符'))
    } else if (value.length > 1000) {
      callback(new Error('公司简介不能超过1000个字符'))
    } else {
      callback()
    }
  }
  
  // 表单验证规则对象
  export const formRules = {
  
    memberName: [
      { validator: validateCompanyName, trigger: 'blur' }
    ],
    shortName: [
      { required: false, message: '请输入公司简称', trigger: 'blur' },
      { min: 2, max: 50, message: '简称长度在2到50个字符', trigger: 'blur' }
    ],
    englishName: [
      { validator: validateEnglishName, trigger: 'blur' }
    ],
    englishShortName: [
      { required: false, message: '请输入英文简称', trigger: 'blur' },
      { pattern: /^[a-zA-Z\s&()-]+$/, message: '英文简称只能包含英文字母、空格和常用符号', trigger: 'blur' },
      { max: 100, message: '英文简称不能超过100个字符', trigger: 'blur' }
    ],
    memberType: [
      { required: false, message: '请选择会员类型', trigger: 'change' }
    ],
    clearingAgentName: [
      { required: false, message: '请输入结算代理机构名称', trigger: 'blur' },
      { max: 100, message: '结算代理机构名称不能超过100个字符', trigger: 'blur' }
    ],
    address: [
      { validator: validateAddress, trigger: 'blur' }
    ],
    'contact.name': [
      { validator: validateContactName, trigger: 'blur' }
    ],
    'contact.phone': [
      { validator: validatePhone, trigger: 'blur' },
      { required: false, message: '请输入手机号码', trigger: 'blur' },
    ],
    'contact.email': [
      { validator: validateEmail, trigger: 'blur' },
      { required: false, message: '请输入邮箱', trigger: 'blur' },
    ],
    companyIntro: [
      { validator: validateCompanyIntro, trigger: 'blur' },
      { required: false, message: '请输入公司简介', trigger: 'blur' },
    ]
  }