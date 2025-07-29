import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
// don't want to use this?
// have a look at the Quick start guide 
// for passing in lng and translations on init

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt'],
    cleanCode: true,
    detection: {
      // this line allows persistence:
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          "hello": "Hello from Express with i18n!",
          "auth": {
            "status": {
              "authenticated": "Authenticated",
              "notAuthenticated": "Not authenticated"
            }
          },
          "language": "Languages",
          "errors": {
            "internal": "Internal server error",
            "somethingWrong": "Something went wrong",
            "missingSMSFields": "Missing 'to' or 'message' in request body"
          },
          "success": {
            "logout": "Logged out successfully",
            "smsSent": "SMS sent!"
          },
          "contactForm": {
            "labels": {
              "firstName": "First Name *",
              "lastName": "Family Name *",
              "phone": "WhatsApp Number *",
              "campus": "Campus *",
              "major": "Major *",
              "year": "Year *",
              "gender": "Gender *",
              "message": "Do you have any questions for us?"
            },
            "placeholders": {
              "message": "Ask anything..."
            },
            "buttons": {
              "submit": "Submit Contact",
              "submitting": "Submitting..."
            },
            "success": "Thanks {{name}} for submitting your contact! We've sent you a confirmation SMS."
          },
          "resources": {
            "title": "Resources",
            "description": "Here are just a few ways you can grow in your personal relationship with God",
            "backButton": "Back to Contact Form",
            "allResources": "All Resources",
            "form": {
              "title": "Title",
              "url": "URL",
              "description": "Description"
            },
            "errors": {
              "addFailed": "Failed to add resource",
              "fetchFailed": "Failed to fetch resources"
            }
          },
          "home": {
            "meta": {
              "title": "Contact Form - Fish and Follow",
              "description": "Submit your contact information"
            },
            "header": {
              "title": "Get in Touch",
              "subtitle": "We'd love to hear from you"
            }
          },
          "navigation": {
            "brand": "Fish & Follow",
            "contactForm": "Contact Form",
            "resources": "Resources",
            "contacts": "Contacts",
            "admin": "Admin",
            "bulkMessaging": "Bulk Messaging",
            "welcome": "Welcome",
            "logout": "Logout",
            "login": "Login",
            "profile": "Profile"
          },
          "dropdowns": {
            "year": {
              "label": "Year",
              "placeholder": "Select Year",
              "options": {
                "1st": "1st Year",
                "2nd": "2nd Year",
                "3rd": "3rd Year",
                "4th": "4th Year",
                "5th+": "5th+ Year"
              }
            },
            "gender": {
              "label": "Gender",
              "placeholder": "Select Gender",
              "options": {
                "male": "Male",
                "female": "Female"
              }
            }
          }
        }
      },
      pt: {
        translation: {
          "hello": "Olá do Express com TypeScript!",
          "auth": {
            "status": {
              "authenticated": "Autenticado",
              "notAuthenticated": "Não autenticado"
            }
          },
          "language": "Idioma",
          "errors": {
            "internal": "Erro interno do servidor",
            "somethingWrong": "Algo deu errado",
            "missingSMSFields": "Faltam campos 'to' ou 'message' no corpo da requisição"
          },
          "success": {
            "logout": "Desconectado com sucesso",
            "smsSent": "SMS enviado!"
          },
          "contactForm": {
            "labels": {
              "firstName": "Nome *",
              "lastName": "Sobrenome *",
              "phone": "Número do WhatsApp *",
              "campus": "Campus *",
              "major": "Curso *",
              "year": "Ano *",
              "gender": "Gênero *",
              "message": "Você tem alguma pergunta para nós?"
            },
            "placeholders": {
              "message": "Pergunte qualquer coisa..."
            },
            "buttons": {
              "submit": "Enviar Contato",
              "submitting": "Enviando..."
            },
            "success": "Obrigado {{name}} por enviar seu contato! Enviamos um SMS de confirmação."
          },
          "resources": {
            "title": "Recursos",
            "description": "Aqui estão algumas maneiras de crescer em seu relacionamento pessoal com Deus",
            "backButton": "Voltar ao Formulário de Contato",
            "allResources": "Todos os Recursos",
            "form": {
              "title": "Título",
              "url": "URL",
              "description": "Descrição"
            },
            "errors": {
              "addFailed": "Falha ao adicionar recurso",
              "fetchFailed": "Falha ao buscar recursos"
            }
          },
          "home": {
            "meta": {
              "title": "Formulário de Contato - Fish and Follow",
              "description": "Envie suas informações de contato"
            },
            "header": {
              "title": "Entre em Contato",
              "subtitle": "Adoraríamos ouvir você"
            }
          },
          "navigation": {
            "brand": "Peixe & Seguir",
            "contactForm": "Formulário de Contato",
            "resources": "Recursos",
            "contacts": "Contatos",
            "admin": "Administração",
            "bulkMessaging": "Mensagens em Massa",
            "welcome": "Bem-vindo",
            "logout": "Sair",
            "login": "Entrar",
            "profile": "Perfil"
          },
          "dropdowns": {
            "year": {
              "label": "Ano",
              "placeholder": "Selecione o Ano",
              "options": {
                "1st": "1º Ano",
                "2nd": "2º Ano",
                "3rd": "3º Ano",
                "4th": "4º Ano",
                "5th+": "5º+ Ano"
              }
            },
            "gender": {
              "label": "Gênero",
              "placeholder": "Selecione o Gênero",
              "options": {
                "male": "Masculino",
                "female": "Feminino"
              }
            }
          }
        }
      }
    }
  });

export default i18n;