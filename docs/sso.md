# Microsoft 标识平台 登录接入文档

## 前言：

1.IBS 使用了Microsoft 标识平台为用户或者应用程序提供标准的身份验证服务

2.什么是 Microsoft 标识平台？

下图显示了高级别的 Microsoft 标识平台，包括应用程序注册体验、SDK、终结点和支持的标识或账户类型。

![](https://learn.microsoft.com/zh-cn/entra/identity-platform/media/v2-overview/about-microsoft-identity-platform.svg)

Microsoft 标识平台由多个组件组成：

- **符合 OAuth 2.0 和 OpenID Connect 标准的身份验证服务**，使开发人员能够对多个标识类型进行身份验证并，包括：
    - 通过 Microsoft Entra ID 预配的工作或学校帐户
    - 个人 Microsoft 帐户（Skype、Xbox、[Outlook.com](http://Outlook.com)）
    - 社交或本地帐户（通过 Azure AD B2C）
    - 社交或本地客户帐户（通过 Microsoft Entra 外部 ID）
- **开源库**：Microsoft 身份验证库 (MSAL)，支持其他符合标准的库。 建议使用开源 MSAL 库，因为它们可以为条件访问方案提供内置支持、向用户提供单一登录 (SSO) 体验，以及内置令牌缓存支持等。 MSAL 支持不同应用程序类型和方案中使用的不同授权和令牌流。
- **Microsoft 标识平台终结点** - Microsoft 标识平台终结点已获得 OIDC 认证。 它适用于 Microsoft 身份验证库 (MSAL) 或任何其他符合标准的库。 它按照行业标准实现了简明易懂的范围。
- **应用程序管理门户**：Microsoft Entra 管理中心内的注册和配置体验，以及其他应用程序管理功能。
- **应用程序配置 API 和 PowerShell**：可通过 Microsoft Graph API 和 PowerShell 以编程方式配置应用程序，以便自动执行 DevOps 任务。

## 应用程序注册：

若要将标识和访问管理功能委托给 Microsoft Entra ID，必须向 Microsoft Entra 租户注册应用程序。 将应用程序注册到 Microsoft Entra ID 时，需要创建应用程序的标识配置，使其能够与 Microsoft Entra ID 集成。 注册应用时，可以选择它是[单租户](https://learn.microsoft.com/zh-cn/entra/identity-platform/single-and-multi-tenant-apps#who-can-sign-in-to-your-app)还是[多租户](https://learn.microsoft.com/zh-cn/entra/identity-platform/single-and-multi-tenant-apps#who-can-sign-in-to-your-app)，并且可以根据需要设置[重定向 URI](https://learn.microsoft.com/zh-cn/entra/identity-platform/reply-url)

示例：下图说明了应用程序的应用程序对象和对应的服务主体对象之间的关系，其上下文是在名为 HR 应用的示例多租户应用程序中。 此示例方案中有三个 Microsoft Entra 租户：

- **Adatum** - 开发 **HR 应用**的公司使用的租户
- **Contoso** - Contoso 组织使用的租户，即 **HR 应用**的使用者
- **Fabrikam** - Fabrikam 组织使用的租户，它也使用 **HR 应用**

![应用对象与服务主体对象之间的关系](https://learn.microsoft.com/zh-cn/entra/identity-platform/media/app-objects-and-service-principals/application-objects-relationship.svg)

| 步骤  | 说明  |
| --- | --- |
| 1   | 在应用程序的宿主租户中创建应用程序对象和服务主体对象的过程。 |
| 2   | 当 Contoso 和 Fabrikam 的管理员完成同意并向应用程序授予访问权限时，会在其公司的 Microsoft Entra 租户中创建服务主体对象，并向其分配管理员所授予的权限。 另请注意，HR 应用可能配置/设计为允许由用户同意以供个人使用。 |
| 3   | HR 应用程序的使用者租户（例如 Contoso 和 Fabrikam）各有自己的服务主体对象。 每个对象代表其在运行时使用的应用程序实例，该实例受相关管理员同意的权限控制。 |

### 参考文档

1.Microsoft Entra ID 中的应用程序和服务主体对象 https://learn.microsoft.com/zh-cn/entra/identity-platform/app-objects-and-service-principals?tabs=browser

2.注册 Microsoft Entra 应用并创建服务主体 https://learn.microsoft.com/zh-cn/entra/identity-platform/howto-create-service-principal-portal

## 接入：

Microsoft 标识平台支持对于各种新式应用程序体系结构的身份验证。 所有这些体系结构基于行业标准协议 [OAuth 2.0 和 OpenID Connect](https://learn.microsoft.com/zh-cn/entra/identity-platform/v2-protocols)。

单页应用、公共客户端和机密客户端应用程序

可通过多种类型的应用程序获取安全令牌。 这些应用程序往往划分为以下三种类别。 每种应用程序配合不同的库和对象使用。

- **单页应用程序**：简称为 SPA。它们是一些 Web 应用，其中的令牌是通过浏览器中运行的 JavaScript 或 TypeScript 应用获取的。 许多新式应用的前端都有一个单页应用程序（主要用 JavaScript 编写）。 该应用程序通常使用 Angular、React 或 Vue 等框架。 MSAL 是唯一支持单页应用程序的 Microsoft 身份验证库。
- **公共客户端应用程序**：此类别中的应用（例如以下类型）始终以用户身份登录：
    - 以登录的用户身份调用 Web API 的桌面应用
    - 移动应用
    - 在没有浏览器的设备上运行的应用，例如，在 IoT 上运行的应用
- **机密客户端应用程序**：此类别中的应用包括：
    - 调用 Web API 的 Web 应用
    - 调用 Web API 的 Web API
    - 守护程序应用（即使实施为 Linux 守护程序或 Windows 服务等控制台服务）

Microsoft 标识平台支持对于以下应用体系结构的身份验证：

- 单页应用
- Web 应用
- Web API
- 移动应用
- 本机应用
- 守护程序应用
- 服务器端应用

应用程序使用不同的身份验证流将用户登录和获取令牌，以调用受保护的 API

### 参考文档

  
\[1\] msal-react-sample/react-18-sample https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/msal-react-samples/react-18-sample   
\[2\] 教程：使用授权代码流让用户登录并从 React 单页应用 (SPA) 调用 Microsoft Graph API  
https://learn.microsoft.com/zh-cn/azure/active-directory/develop/tutorial-v2-react   
\[3\] 微软身份平台和 OAuth 2.0 授权代码流/请求授权代码 https://learn.microsoft.com/zh-cn/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-authorization-code   
\[4\] Graph Explorer  
https://developer.microsoft.com/zh-cn/graph/graph-explorer-china   
\[5\] 使用 MSAL.js 在身份验证请求中传递自定义状态  
https://learn.microsoft.com/zh-cn/azure/active-directory/develop/msal-js-pass-custom-state-authentication-request 

## Java

- 快速入门：使用 Microsoft 标识平台保护 Web API  
    https://learn.microsoft.com/zh-cn/azure/active-directory/develop/web-app-quickstart?pivots=devlang-java 
- Securing Java apps using the Microsoft Identity platform and MSAL Java  
    https://github.com/Azure-Samples/ms-identity-msal-java-samples 
- A Java Web API that calls another web API with the Microsoft identity platform using the On-Behalf-Of flow  
    [https://github.com/Azure-Samples/ms-identity-msal-java-samples/blob/main/1. Server-Side Scenarios/msal-web-api-sample/README.md](https://github.com/Azure-Samples/ms-identity-msal-java-samples/blob/main/1.%20Server-Side%20Scenarios/msal-web-api-sample/README.md)