// Language configuration
const DEFAULT_LANGUAGE = 'bg';
const LANGUAGE_STORAGE_KEY = 'appLanguage';
const LANGUAGE_STORAGE_KEYS = ['appLanguage', 'app_lang', 'app_language'];

const TRANSLATIONS = {
    bg: {
        page: {
            title: 'Табло'
        },
        common: {
            brand: 'ГДПБЗН'
        },
        auth: {
            login: 'Вход',
            loginTitle: 'Вход - ГДПБЗН',
            registerTitle: 'Регистрация - ГДПБЗН',
            loginSubtitle: 'в информационната система',
            register: 'Регистрация',
            registerSubtitle: 'създай нов профил',
            username: 'Потребителско име',
            password: 'Парола',
            fullName: 'Пълно име',
            role: 'Роля',
            selectRole: 'Избери роля',
            operator: 'Оператор',
            firefighter: 'Пожарникари',
            admin: 'Администратор',
            usernameLabel: 'Потребителско име',
            passwordLabel: 'Парола',
            fullNameLabel: 'Пълно име',
            roleLabel: 'Роля',
            usernameInput: 'Въведи потребителско име',
            passwordInput: 'Въведи парола',
            fullNameInput: 'Въведи пълното си име',
            loginButton: 'Вход',
            loginButtonLoading: 'Влизане...',
            registerButton: 'Регистрация',
            registerButtonLoading: 'Регистрация...',
            noAccount: 'Нямаш акаунт?',
            registerLink: 'Регистрирай се',
            haveAccount: 'Вече имаш акаунт?',
            loginLink: 'Вход',
            welcome: 'Добре дошли',
            systemManagement: 'Управление на произшествия',
            joinSystem: 'Присъедини се',
            toSystem: 'към системата'
        },
        index: {
            nav: {
                brand: 'ГДПБЗН',
                features: 'Функции',
                about: 'За системата'
            },
            hero: {
                title: 'Информационна система на ГДПБЗН',
                subtitle: 'Управление и координация на произшествия в реално време',
                loginButton: 'Вход',
                registerButton: 'Регистрация'
            },
            features: {
                title: 'Основни функции',
                incidentManagement: 'Управление на произшествия',
                incidentManagementText: 'Бързо създаване, преглед и управление на всички произшествия',
                teamManagement: 'Управление на екипи',
                teamManagementText: 'Организирайте и координирайте работните екипи',
                vehicleManagement: 'Управление на превозни средства',
                vehicleManagementText: 'Проследяване и контрол на всички превозни средства',
                shiftPlanning: 'Планиране на смени',
                shiftPlanningText: 'Ефективно планиране на работни смени',
                analytics: 'Отчети и аналитика',
                analyticsText: 'Детайлни статистики и анализ на произшествия',
                gpsTracking: 'GPS проследяване',
                gpsTrackingText: 'Реално време локализация на екипи и средства'
            },
            about: {
                title: 'За системата',
                description: 'Модерната информационна система на ГДПБЗН предоставя интегрирано решение за управление на произшествия, екипи и ресурси. Системата е проектирана за максимална ефективност и лесна употреба.'
            },
            footer: {
                copyright: '© 2026 ГДПБЗН. Всички права запазени.'
            }
        },
        profile: {
            title: 'Профил',
            subtitle: 'Управление на профил',
            myProfile: 'Моят профил',
            profileSubtitle: 'Промени твоите лични данни',
            informationTitle: 'Профилна информация',
            fullName: 'Пълно име',
            fullNamePlaceholder: 'Въведи пълно име',
            username: 'Потребителско име',
            usernamePlaceholder: 'Въведи потребителско име',
            phone: 'Телефон',
            phonePlaceholder: '(по желание)',
            role: 'Роля',
            status: 'Статус',
            statusOnDuty: 'На дежурство',
            statusOffDuty: 'Извън дежурство',
            statusOnMission: 'На задача',
            statusVacation: 'Отпуск',
            statusSickLeave: 'Болен',
            newPassword: 'Нова парола',
            confirmPassword: 'Потвърди парола',
            passwordPlaceholder: '(остави празно за без промяна)',
            saveButton: 'Запази',
            saveButtonLoading: 'Запазване...'
        },
        firefighters: {
            title: 'Пожарникари',
            subtitle: 'Управление на пожарникари',
            description: 'Преглед на всички регистрирани пожарникари',
            accessDeniedTitle: 'Достъп забранен',
            accessDeniedText: 'Само администратори могат да видят страницата на пожарникарите',
            firefighterRole: 'Пожарникар',
            removeAccessDenied: 'Нямате достъп да премахнете пожарникар',
            removeError: 'Грешка при премахване на пожарникар',
            removeSuccess: 'Пожарникарът е успешно премахнат!',
            confirmRemove: 'Сигурни ли сте, че искате да премахнете {{name}}?',
            listTitle: 'Списък с пожарникари',
            searchPlaceholder: 'Търси по име или потребителско име...',
            detailsHeading: 'Детайли на пожарникар',
            detailNameLabel: 'Име:',
            detailUsernameLabel: 'Потребителско име:',
            detailRoleLabel: 'Должност:',
            detailStatusLabel: 'Статус:',
            detailPhoneLabel: 'Телефон:',
            detailEmailLabel: 'Email:',
            detailCloseButton: 'Затвори',
            detailRemoveButton: 'Премахни',
            loading: 'Зареждане на пожарникари...',
            addButton: 'Добави пожарникар',
            emptyTitle: 'Няма пожарникари',
            emptyDescription: 'Добавете първи пожарникар',
            table: {
                name: 'Име',
                number: 'Номер',
                role: 'Должност',
                status: 'Статус',
                phone: 'Телефон',
                actions: 'Действия'
            },
            stats: {
                total: 'Общо пожарникари',
                allRegistered: 'Всички регистрирани',
                active: 'Активни',
                onDuty: 'На дежурство',
                onVacation: 'На отпуск',
                onBreak: 'На почивка',
                sick: 'Болни',
                onSickLeave: 'На болнично отпускане'
            }
        },
        teams: {
            title: 'Екипи',
            subtitle: 'Управление на отбори',
            description: 'Следете и ръководете всички екипи в системата',
            createButton: 'Създай екип',
            myTeamTitle: 'Мой екип',
            myTeamName: 'Мой екип',
            membersTitle: 'Членове на екипа',
            noMembers: 'Няма членове',
            assignedVehicleTitle: 'Назначен автомобил',
            noAssignedVehicle: 'Няма назначен автомобил',
            loading: 'Зареждане на екипи...',
            noTeamTitle: 'Не сте назначени на екип',
            noTeamDescription: 'Администраторът ще ви назначи на екип скоро',
            createModalTitle: 'Създай нов екип',
            editModalTitle: 'Редактирай екип',
            teamNameLabel: 'Име на екипа*',
            teamNamePlaceholder: 'Например: Екип 1',
            teamStationLabel: 'Станция',
            teamStationPlaceholder: 'Например: Централна станция',
            teamTypeLabel: 'Тип екип',
            teamTypeOperational: 'Оперативен',
            teamTypeSupport: 'Подпомагащ',
            teamTypeRescue: 'Спасителен',
            teamCommanderLabel: 'Командир на екипа',
            selectCommander: 'Избери командир',
            addMembersTitle: 'Добави членове',
            availableFirefightersLabel: 'Налични пожарникари',
            firefighterSearchPlaceholder: 'Търси по име или потребителско име...',
            loadingFirefighters: 'Зареждане на пожарникари...',
            noSelectedFirefighters: 'Няма избрани пожарникари',
            assignVehicleTitle: 'Назначи автомобил',
            availableVehiclesLabel: 'Налични автомобили',
            loadingVehicles: 'Зареждане на автомобили...',
            cancelButton: 'Отмени',
            saveChangesButton: 'Запази изменения',
            addTeamButton: 'Създай екип',
            closeModal: 'Затвори',
            stationLabel: 'Станция',
            typeLabel: 'Тип',
            commanderLabel: 'Командир',
            statusLabel: 'Статус',
            statusAvailable: 'Налично',
            statusOnMission: 'На задача',
            statusMaintenance: 'Поддържане',
            viewButton: 'Преглед',
            editButton: 'Редактирай',
            deleteButton: 'Изтрий',
            memberCount: '{{count}} членове',
            firefighterRole: 'Пожарникар',
            noTeams: 'Няма екипи',
            loadTeamError: 'Грешка при зареждане на екипа',
            loadTeamsError: 'Грешка при зареждане на екипи',
            createTeamError: 'Грешка при създаване на екип',
            createTeamSuccess: 'Екипът е успешно създаден!',
            updateTeamError: 'Грешка при обновяване на екипа',
            updateTeamSuccess: 'Екипът е обновен успешно',
            statusAvailable: 'Налично',
            statusOnMission: 'На задача',
            statusMaintenance: 'Поддържане',
            statusOffDuty: 'Извън дежурство',
            statusOnDuty: 'На дежурство',
            statusVacation: 'Отпуск',
            statusSickLeave: 'Болен',
            deleteTeamError: 'Грешка при премахване на екип',
            deleteTeamSuccess: 'Екипът е успешно премахнат!',
            confirmDelete: 'Сигурни ли сте, че искате да премахнете този екип?',
            enterTeamName: 'Моля, въведете име на екипа',
            invalidTeam: 'Невалиден екип',
            assignedVehicleNone: 'Няма назначен автомобил',
            selectedFirefightersNone: 'Няма избрани пожарникари'
        },
        vehicles: {
            title: 'Автомобили',
            subtitle: 'Управление на автомобили',
            description: 'Управление и преглед на автомобилния парк',
            registerButton: 'Регистрирай автомобил',
            searchPlaceholder: 'Търси по сигнал или номер на маса...',
            loading: 'Зареждане на автомобили...',
            filters: {
                allStatuses: 'Всички статуси',
                available: 'Налично',
                onMission: 'На задача',
                maintenance: 'Поддържане',
                allTypes: 'Всички типове',
                fireTruck: 'Пожарен автомобил',
                cistern: 'Цистерна',
                support: 'Подпомагащ'
            },
            registerModalTitle: 'Регистрирай нов автомобил',
            closeModal: 'Затвори',
            vehicleCallsignLabel: 'Сигнал*',
            vehicleCallsignPlaceholder: 'Например: ПА-1',
            loadVehiclesError: 'Грешка при зареждане на автомобили',
            noVehicles: 'Няма автомобили',
            fillRequiredFields: 'Моля, попълнете всички задължителни полета',
            registrationError: 'Грешка при регистриране на автомобил',
            registrationSuccess: 'Автомобилът е успешно регистриран!',
            loadDetailsError: 'Грешка при зареждане на детайли',
            invalidVehicle: 'Невалиден автомобил',
            vehiclePlateLabel: 'Номер на маса*',
            vehiclePlatePlaceholder: 'Например: СФ 1234 АА',
            vehicleTypeLabel: 'Тип автомобил*',
            vehicleTypePlaceholder: 'Избери тип',
            vehicleTypeFireTruck: 'Пожарен автомобил',
            vehicleTypeCistern: 'Цистерна',
            vehicleTypeSupport: 'Подпомагащ',
            statusAvailable: 'Налично',
            statusOnMission: 'На задача',
            statusMaintenance: 'Поддържане',
            vehicleWaterCapacityLabel: 'Капацитет вода (литри)',
            vehicleWaterCapacityPlaceholder: 'Например: 2000',
            vehicleFoamCapacityLabel: 'Капацитет пяна (литри)',
            vehicleFoamCapacityPlaceholder: 'Например: 500',
            literSuffix: 'л',
            cancelButton: 'Отмени',
            submitButton: 'Регистрирай',
            detailsModalTitle: 'Детайли на автомобила',
            detailLabelCallsign: 'Сигнал',
            detailLabelPlate: 'Номер на маса',
            detailLabelType: 'Тип',
            detailLabelStatus: 'Статус',
            detailLabelWaterCapacity: 'Капацитет вода',
            detailLabelFoamCapacity: 'Капацитет пяна',
            detailLabelAssignedTeam: 'Назначен екип',
            detailLabelLocation: 'Последна позиция',
            teamLabel: 'Екип',
            detailsButton: 'Детайли',
            detailCloseButton: 'Затвори'
        },
        addIncident: {
            title: 'Добави ново произшествие',
            subtitle: 'Попълнете информацията за произшествието',
            typeLabel: 'Тип произшествие',
            typePlaceholder: '-- Избери тип --',
            typeFire: 'Пожар',
            typeAccident: 'Катастрофа',
            typeRescue: 'Спасяване',
            typeMedical: 'Медицинска помощ',
            typeHazmat: 'Опасен материал',
            typeConcern: 'Загрижване',
            typeOther: 'Други',
            addressLabel: 'Адрес',
            addressPlaceholder: 'Въведи адреса на произшествието',
            coordinatesMode: 'Координати',
            mapMode: 'Избери на карта',
            latitudeLabel: 'Широчина (GPS)',
            latitudePlaceholder: 'Напр. 42.6977',
            longitudeLabel: 'Дължина (GPS)',
            longitudePlaceholder: 'Напр. 23.3219',
            mapInfo: 'Щракни на картата, за да избереш локацията на произшествието',
            selectedLocation: 'Избрана локация:',
            useMapCoords: 'Използвай тази локация',
            descriptionLabel: 'Описание',
            descriptionPlaceholder: 'Допълнителни детайли за произшествието',
            assignTeamLabel: 'Назначи екип',
            teamPlaceholder: '-- Избери екип (опционално) --',
            submitButton: 'Добави произшествие',
            cancelButton: 'Отмени',
            successTitle: 'Произшествие добавено',
            successText: 'Произшествието е успешно регистрирано в системата.',
            errorText: 'Възникна грешка при добавяне на произшествието.',
            clickMap: 'Моля, щракни на картата, за да изберeш локация',
            coordinatesSetSuccess: 'Координатите са успешно зададени. Сега можеш да добавиш произшествието.',
            fillRequiredFields: 'Моля, попълнете всички задължителни полета',
            gpsInvalid: 'GPS координатите трябва да са валидни числа',
            loading: 'Зареждане...',
            createError: 'Грешка при добавяне на произшествието',
            cancelConfirm: 'Наистина ли искаш да отмениш добавянето на произшествието?'
        },
        dashboard: {
            title: 'Табло',
            subtitle: 'Управление на произшествия',
            addIncident: 'Добави произшествие',
            panelTitle: 'Списък с произшествия',
            emptyState: 'Няма произшествия',
            emptyStateDetails: 'Започнете, като кликнете на "Добави произшествие"',
            loadingIncidents: 'Зареждане на произшествия...'
        },
        recordCount: {
            one: '1 запис',
            other: '{{count}} записа'
        },
        menu: {
            incidents: 'Произшествия',
            firefighters: 'Пожарникари',
            teams: 'Екипи',
            vehicles: 'Автомобили',
            shifts: 'Смени',
            settings: 'Настройки',
            profile: 'Профил'
        },
        stats: {
            totalIncidents: 'Общо произшествия',
            active: 'Активни',
            completed: 'Приключени',
            onHold: 'Екипи на смяна',
            allIncidents: 'Всички произшествия',
            currentlyProcessing: 'Текущо обработвани',
            completedIncidents: 'Завършени произшествия',
            activeTeams: 'Активни екипи'
        },
        filters: {
            searchPlaceholder: 'Търси произшествие...',
            allStatuses: 'Всички статуси',
            active: 'Активно',
            inProgress: 'В работа',
            completed: 'Приключено',
            onHold: 'Приостановено',
            cancelled: 'Отменено'
        },
        table: {
            id: 'ID',
            type: 'Тип',
            address: 'Адрес',
            dateTime: 'Дата & Час',
            status: 'Статус',
            actions: 'Действие',
            view: 'Преглед',
            tasks: 'Задачи'
        },
        detail: {
            heading: 'Детайли на произшествие',
            id: 'ID:',
            type: 'Тип:',
            address: 'Адрес:',
            dateTime: 'Дата и час:',
            description: 'Описание:',
            coordinates: 'GPS координати:',
            team: 'Екип:',
            status: 'Статус:',
            update: 'Обновяване',
            close: 'Затвори',
            delete: 'Изтрий произшествие',
            unknown: 'Неизвестен',
            noDescription: '(Няма описание)',
            notAssigned: 'Не е определен'
        },
        task: {
            heading: 'Задачи на произшествието',
            addSection: 'Добави нова задача',
            titlePlaceholder: 'Заглавие на задачата',
            descriptionPlaceholder: 'Описание (незадължително)',
            addButton: 'Добави задача',
            noTasks: 'Няма задачи',
            loading: 'Зареждане...',
            loadError: 'Грешка при зареждане на задачите',
            done: 'Изпълнена',
            pending: 'В процес',
            markDone: 'Маркирай като готова',
            noDescription: 'Без описание',
            enterTitle: 'Моля, въведете заглавие.'
        },
        notifications: {
            title: 'Уведомления',
            noNotifications: 'Няма нови уведомления',
            markAllRead: 'Маркирай всички като прочетени',
            loadError: 'Грешка при зареждане на уведомления',
            relativeSeconds: 'Преди няколко секунди',
            relativeMinutes: 'Преди {{count}} мин.',
            relativeHours: 'Преди {{count}} ч.',
            relativeDays: 'Преди {{count}} д.'
        },
        alerts: {
            loginError: 'Грешка при вход',
            loginSuccess: 'Успешен вход!',
            registerError: 'Грешка при регистрация',
            registerSuccess: 'Успешна регистрация!',
            profileLoadError: 'Неуспешно зареждане на профила',
            profileUpdateError: 'Неуспешно обновяване на профила',
            profileUpdateSuccess: 'Профилът е обновен успешно.',
            invalidProfile: 'Невалиден профил',
            passwordMismatch: 'Паролите не съвпадат',
            errorPrefix: 'Грешка',
            loadDetailsError: 'Грешка при зареждане на детайлите',
            statusUpdateSuccess: 'Статусът е успешно обновен!',
            statusUpdateError: 'Грешка при обновяване на статуса',
            deleteConfirm: 'Наистина ли искаш да изтриеш произшествието #{{id}}? Това действие е необратимо.',
            deleteSuccess: 'Произшествието е успешно изтрито!',
            deleteError: 'Възникна грешка при изтриване на произшествието',
            taskTitleRequired: 'Моля, въведете заглавие.',
            taskAddError: 'Грешка при добавяне на задачата: {{error}}',
            taskUpdateError: 'Грешка при обновяване на статуса на задачата'
        }
    },
    en: {
        page: {
            title: 'Dashboard'
        },
        auth: {
            login: 'Login',
            loginTitle: 'Login - GDBPZN',
            registerTitle: 'Register - GDBPZN',
            loginSubtitle: 'to the system',
            register: 'Register',
            registerSubtitle: 'create a new profile',
            username: 'Username',
            password: 'Password',
            fullName: 'Full Name',
            role: 'Role',
            selectRole: 'Select role',
            operator: 'Operator',
            firefighter: 'Firefighter',
            admin: 'Administrator',
            usernameLabel: 'Username',
            passwordLabel: 'Password',
            fullNameLabel: 'Full Name',
            roleLabel: 'Role',
            usernameInput: 'Enter username',
            passwordInput: 'Enter password',
            fullNameInput: 'Enter your full name',
            loginButton: 'Login',
            registerButton: 'Register',
            registerButtonLoading: 'Registering...',
            noAccount: 'Do not have an account?',
            registerLink: 'Register',
            haveAccount: 'Already have an account?',
            loginLink: 'Login',
            welcome: 'Welcome',
            systemManagement: 'Incident Management',
            joinSystem: 'Join Us',
            toSystem: 'to the system'
        },
        index: {
            nav: {
                brand: 'GDBPZN Incident System',
                features: 'Features',
                about: 'About'
            },
            hero: {
                title: 'GDBPZN Incident Management System',
                subtitle: 'Manage and coordinate incidents in real time',
                loginButton: 'Login',
                registerButton: 'Register'
            },
            features: {
                title: 'Core Features',
                incidentManagement: 'Incident Management',
                incidentManagementText: 'Quickly create, review, and manage all incidents',
                teamManagement: 'Team Management',
                teamManagementText: 'Organize and coordinate working teams',
                vehicleManagement: 'Vehicle Management',
                vehicleManagementText: 'Track and control all vehicles',
                shiftPlanning: 'Shift Planning',
                shiftPlanningText: 'Plan work shifts efficiently',
                analytics: 'Reports and Analytics',
                analyticsText: 'Detailed statistics and incident analysis',
                gpsTracking: 'GPS Tracking',
                gpsTrackingText: 'Real-time location of teams and assets'
            },
            about: {
                title: 'About the System',
                description: 'The modern GDBPZN incident management system provides an integrated solution for managing incidents, teams, and resources. It is designed for maximum efficiency and ease of use.'
            },
            footer: {
                copyright: '© 2026 GDBPZN Incident System. All rights reserved.'
            }
        },
        profile: {
            title: 'Profile',
            subtitle: 'Profile management',
            myProfile: 'My Profile',
            profileSubtitle: 'Update your personal information',
            informationTitle: 'Profile Information',
            fullName: 'Full Name',
            fullNamePlaceholder: 'Enter full name',
            username: 'Username',
            usernamePlaceholder: 'Enter username',
            phone: 'Phone',
            phonePlaceholder: '(optional)',
            role: 'Role',
            status: 'Status',
            statusOnDuty: 'On duty',
            statusOffDuty: 'Off duty',
            statusOnMission: 'On mission',
            statusVacation: 'On vacation',
            statusSickLeave: 'Sick leave',
            newPassword: 'New password',
            confirmPassword: 'Confirm password',
            passwordPlaceholder: '(leave blank to keep current)',
            saveButton: 'Save',
            saveButtonLoading: 'Saving...'
        },
        firefighters: {
            title: 'Firefighters',
            subtitle: 'Manage firefighter records',
            description: 'Review and coordinate all registered firefighters',
            accessDeniedTitle: 'Access denied',
            accessDeniedText: 'Only administrators can view the firefighters page',
            firefighterRole: 'Firefighter',
            removeAccessDenied: 'You do not have permission to remove a firefighter',
            removeError: 'Failed to remove firefighter',
            removeSuccess: 'Firefighter removed successfully!',
            confirmRemove: 'Are you sure you want to remove {{name}}?',
            listTitle: 'Firefighter List',
            searchPlaceholder: 'Search by name or username...',
            detailsHeading: 'Firefighter Details',
            detailNameLabel: 'Name:',
            detailUsernameLabel: 'Username:',
            detailRoleLabel: 'Role:',
            detailStatusLabel: 'Status:',
            detailPhoneLabel: 'Phone:',
            detailEmailLabel: 'Email:',
            detailCloseButton: 'Close',
            detailRemoveButton: 'Remove',
            loading: 'Loading firefighters...',
            addButton: 'Add Firefighter',
            emptyTitle: 'No firefighters yet',
            emptyDescription: 'Add the first firefighter to get started.',
            table: {
                name: 'Name',
                number: 'Number',
                role: 'Role',
                status: 'Status',
                phone: 'Phone',
                actions: 'Actions'
            },
            stats: {
                total: 'Total Firefighters',
                allRegistered: 'All registered',
                active: 'Active',
                onDuty: 'On duty',
                onVacation: 'On vacation',
                onBreak: 'On break',
                sick: 'Sick',
                onSickLeave: 'On sick leave'
            }
        },
        teams: {
            title: 'Teams',
            subtitle: 'Team management',
            description: 'Track and coordinate all teams in the system',
            createButton: 'Create Team',
            myTeamTitle: 'My Team',
            myTeamName: 'My Team',
            membersTitle: 'Team Members',
            noMembers: 'No members',
            assignedVehicleTitle: 'Assigned Vehicle',
            noAssignedVehicle: 'No assigned vehicle',
            loading: 'Loading teams...',
            noTeamTitle: 'No team assigned',
            noTeamDescription: 'Your administrator will assign you to a team soon',
            createModalTitle: 'Create Team',
            editModalTitle: 'Edit Team',
            teamNameLabel: 'Team Name*',
            teamNamePlaceholder: 'For example: Team 1',
            teamStationLabel: 'Station',
            teamStationPlaceholder: 'For example: Central Station',
            teamTypeLabel: 'Team Type',
            teamTypeOperational: 'Operational',
            teamTypeSupport: 'Support',
            teamTypeRescue: 'Rescue',
            teamCommanderLabel: 'Team Commander',
            selectCommander: 'Select commander',
            addMembersTitle: 'Add members',
            availableFirefightersLabel: 'Available firefighters',
            firefighterSearchPlaceholder: 'Search by name or username...',
            loadingFirefighters: 'Loading firefighters...',
            noSelectedFirefighters: 'No firefighters selected',
            assignVehicleTitle: 'Assign Vehicle',
            availableVehiclesLabel: 'Available vehicles',
            loadingVehicles: 'Loading vehicles...',
            cancelButton: 'Cancel',
            saveChangesButton: 'Save changes',
            addTeamButton: 'Create Team',
            closeModal: 'Close',
            stationLabel: 'Station',
            typeLabel: 'Type',
            commanderLabel: 'Commander',
            statusLabel: 'Status',
            statusAvailable: 'Available',
            statusOnMission: 'On mission',
            statusMaintenance: 'Maintenance',
            statusOffDuty: 'Off duty',
            statusOnDuty: 'On duty',
            statusVacation: 'On vacation',
            statusSickLeave: 'Sick leave',
            viewButton: 'View',
            editButton: 'Edit',
            deleteButton: 'Delete',
            memberCount: '{{count}} members',
            firefighterRole: 'Firefighter',
            noTeams: 'No teams',
            loadTeamError: 'Failed to load team',
            loadTeamsError: 'Failed to load teams',
            createTeamError: 'Failed to create team',
            createTeamSuccess: 'Team created successfully!',
            updateTeamError: 'Failed to update team',
            updateTeamSuccess: 'Team updated successfully!',
            deleteTeamError: 'Failed to delete team',
            deleteTeamSuccess: 'Team deleted successfully!',
            confirmDelete: 'Are you sure you want to delete this team?',
            enterTeamName: 'Please enter a team name',
            invalidTeam: 'Invalid team',
            assignedVehicleNone: 'No assigned vehicle',
            selectedFirefightersNone: 'No firefighters selected'
        },
        vehicles: {
            title: 'Vehicles',
            subtitle: 'Vehicle management',
            description: 'Manage and review the vehicle fleet',
            registerButton: 'Register Vehicle',
            searchPlaceholder: 'Search by callsign or fleet number...',
            loading: 'Loading vehicles...',
            filters: {
                allStatuses: 'All statuses',
                available: 'Available',
                onMission: 'On mission',
                maintenance: 'Maintenance',
                allTypes: 'All types',
                fireTruck: 'Fire Truck',
                cistern: 'Cistern',
                support: 'Support'
            },
            registerModalTitle: 'Register new vehicle',
            closeModal: 'Close',
            vehicleCallsignLabel: 'Callsign*',
            vehicleCallsignPlaceholder: 'For example: PA-1',
            loadVehiclesError: 'Failed to load vehicles',
            noVehicles: 'No vehicles found',
            fillRequiredFields: 'Please fill in all required fields',
            registrationError: 'Failed to register vehicle',
            registrationSuccess: 'Vehicle registered successfully!',
            loadDetailsError: 'Failed to load details',
            invalidVehicle: 'Invalid vehicle',
            vehiclePlateLabel: 'Fleet number*',
            vehiclePlatePlaceholder: 'For example: SF 1234 AA',
            vehicleTypeLabel: 'Vehicle Type*',
            vehicleTypePlaceholder: 'Select type',
            vehicleTypeFireTruck: 'Fire Truck',
            vehicleTypeCistern: 'Cistern',
            vehicleTypeSupport: 'Support',
            statusAvailable: 'Available',
            statusOnMission: 'On mission',
            statusMaintenance: 'Maintenance',
            vehicleWaterCapacityLabel: 'Water capacity (liters)',
            vehicleWaterCapacityPlaceholder: 'For example: 2000',
            vehicleFoamCapacityLabel: 'Foam capacity (liters)',
            vehicleFoamCapacityPlaceholder: 'For example: 500',
            literSuffix: 'L',
            cancelButton: 'Cancel',
            submitButton: 'Register',
            detailsModalTitle: 'Vehicle Details',
            detailLabelCallsign: 'Callsign',
            detailLabelPlate: 'Fleet number',
            detailLabelType: 'Type',
            detailLabelStatus: 'Status',
            detailLabelWaterCapacity: 'Water capacity',
            detailLabelFoamCapacity: 'Foam capacity',
            detailLabelAssignedTeam: 'Assigned team',
            detailLabelLocation: 'Last location',
            teamLabel: 'Team',
            detailsButton: 'Details',
            detailCloseButton: 'Close'
        },
        addIncident: {
            title: 'Add New Incident',
            subtitle: 'Fill in the incident details',
            typeLabel: 'Incident Type',
            typePlaceholder: '-- Select type --',
            typeFire: 'Fire',
            typeAccident: 'Accident',
            typeRescue: 'Rescue',
            typeMedical: 'Medical Assistance',
            typeHazmat: 'Hazardous Material',
            typeConcern: 'Concern',
            typeOther: 'Other',
            addressLabel: 'Address',
            addressPlaceholder: 'Enter the incident address',
            coordinatesMode: 'Coordinates',
            mapMode: 'Choose on map',
            latitudeLabel: 'Latitude (GPS)',
            latitudePlaceholder: 'e.g. 42.6977',
            longitudeLabel: 'Longitude (GPS)',
            longitudePlaceholder: 'e.g. 23.3219',
            mapInfo: 'Click on the map to select the incident location',
            selectedLocation: 'Selected location:',
            useMapCoords: 'Use this location',
            descriptionLabel: 'Description',
            descriptionPlaceholder: 'Additional incident details',
            assignTeamLabel: 'Assign a team',
            teamPlaceholder: '-- Choose a team (optional) --',
            submitButton: 'Add Incident',
            cancelButton: 'Cancel',
            successTitle: 'Incident added',
            successText: 'The incident has been successfully registered in the system.',
            errorText: 'An error occurred while adding the incident.',
            clickMap: 'Please click on the map to select a location',
            coordinatesSetSuccess: 'Coordinates have been set. You can now submit the incident.',
            fillRequiredFields: 'Please fill in all required fields',
            gpsInvalid: 'GPS coordinates must be valid numbers',
            loading: 'Loading...',
            createError: 'Error adding the incident',
            cancelConfirm: 'Are you sure you want to cancel incident creation?'
        },
        dashboard: {
            title: 'Dashboard',
            subtitle: 'Incident operations overview',
            addIncident: 'Add Incident',
            panelTitle: 'Incident List',
            emptyState: 'No incidents found',
            emptyStateDetails: 'Start by clicking "Add Incident"',
            loadingIncidents: 'Loading incidents...'
        },
        recordCount: {
            one: '1 record',
            other: '{{count}} records'
        },
        menu: {
            incidents: 'Incidents',
            firefighters: 'Firefighters',
            teams: 'Teams',
            vehicles: 'Vehicles',
            shifts: 'Shifts',
            settings: 'Settings',
            profile: 'Profile'
        },
        stats: {
            totalIncidents: 'Total Incidents',
            active: 'Active',
            completed: 'Completed',
            onHold: 'Teams On Duty',
            allIncidents: 'All incidents',
            currentlyProcessing: 'Currently processing',
            completedIncidents: 'Completed incidents',
            activeTeams: 'Active teams'
        },
        filters: {
            searchPlaceholder: 'Search incidents...',
            allStatuses: 'All statuses',
            active: 'Active',
            inProgress: 'In Progress',
            completed: 'Completed',
            onHold: 'On Hold',
            cancelled: 'Cancelled'
        },
        table: {
            id: 'ID',
            type: 'Type',
            address: 'Address',
            dateTime: 'Date & Time',
            status: 'Status',
            actions: 'Actions',
            view: 'View',
            tasks: 'Tasks'
        },
        detail: {
            heading: 'Incident Details',
            id: 'ID:',
            type: 'Type:',
            address: 'Address:',
            dateTime: 'Date & Time:',
            description: 'Description:',
            coordinates: 'GPS Coordinates:',
            team: 'Team:',
            teamPrefix: 'Team ID:',
            status: 'Status:',
            update: 'Update',
            close: 'Close',
            delete: 'Delete Incident',
            unknown: 'Unknown',
            noDescription: '(No description)',
            notAssigned: 'Not assigned'
        },
        task: {
            heading: 'Incident Tasks',
            addSection: 'Add a new task',
            titlePlaceholder: 'Task title',
            descriptionPlaceholder: 'Description (optional)',
            addButton: 'Add task',
            noTasks: 'No tasks',
            loading: 'Loading...',
            loadError: 'Failed to load tasks',
            done: 'Done',
            pending: 'In progress',
            markDone: 'Mark as done',
            noDescription: 'No description',
            enterTitle: 'Please enter a title.'
        },
        notifications: {
            title: 'Notifications',
            noNotifications: 'No new notifications',
            markAllRead: 'Mark all as read',
            loadError: 'Failed to load notifications',
            relativeSeconds: 'A few seconds ago',
            relativeMinutes: '{{count}} min. ago',
            relativeHours: '{{count}} hr. ago',
            relativeDays: '{{count}} d. ago'
        },
        alerts: {
            loginError: 'Login failed',
            loginSuccess: 'Login successful!',
            registerError: 'Registration failed',
            registerSuccess: 'Registration successful!',
            profileLoadError: 'Unable to load profile',
            profileUpdateError: 'Unable to update profile',
            profileUpdateSuccess: 'Profile updated successfully.',
            invalidProfile: 'Invalid profile data',
            passwordMismatch: 'Passwords do not match',
            errorPrefix: 'Error',
            loadDetailsError: 'Unable to load details',
            statusUpdateSuccess: 'Status updated successfully!',
            statusUpdateError: 'Failed to update status',
            deleteConfirm: 'Do you really want to delete incident #{{id}}? This action cannot be undone.',
            deleteSuccess: 'Incident deleted successfully!',
            deleteError: 'Failed to delete the incident',
            taskTitleRequired: 'Please enter a title.',
            taskAddError: 'Failed to add the task: {{error}}',
            taskUpdateError: 'Failed to update the task status'
        }
    }
};

function saveLanguage(lang) {
    LANGUAGE_STORAGE_KEYS.forEach(key => localStorage.setItem(key, lang));
}

function getSavedLanguage() {
    for (const key of LANGUAGE_STORAGE_KEYS) {
        const saved = localStorage.getItem(key);
        if (saved && TRANSLATIONS[saved]) {
            return saved;
        }
    }
    return DEFAULT_LANGUAGE;
}

function resolveTranslationKey(key, lang) {
    const parts = key.split('.');
    let value = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE];
    for (const part of parts) {
        if (!value || typeof value !== 'object') {
            return undefined;
        }
        value = value[part];
    }
    return typeof value === 'string' ? value : undefined;
}

function translate(key, params = {}) {
    const lang = window.currentLanguage || getSavedLanguage();
    let text = resolveTranslationKey(key, lang) || resolveTranslationKey(key, DEFAULT_LANGUAGE) || key;
    Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
    return text;
}

function applyTranslations(lang = getSavedLanguage()) {
    window.currentLanguage = lang;
    saveLanguage(lang);

    document.documentElement.lang = lang;

    document.querySelectorAll('head title[data-i18n]').forEach(el => {
        const translationKey = el.getAttribute('data-i18n');
        if (!translationKey) return;
        el.textContent = translate(translationKey);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const translationKey = el.getAttribute('data-i18n');
        if (!translationKey) return;
        el.textContent = translate(translationKey);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const translationKey = el.getAttribute('data-i18n-placeholder');
        if (!translationKey) return;
        el.placeholder = translate(translationKey);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const translationKey = el.getAttribute('data-i18n-title');
        if (!translationKey) return;
        el.title = translate(translationKey);
    });

    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = lang;
    }
}

function setupLanguageSwitcher() {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) return;

    // Prevent duplicate listeners
    if (languageSelect.dataset.languageListenerAttached) return;
    
    languageSelect.addEventListener('change', (event) => {
        const newLang = event.target.value;
        applyTranslations(newLang);
        
        // Sync to all storage keys for compatibility
        localStorage.setItem('appLanguage', newLang);
        localStorage.setItem('app_lang', newLang);
        localStorage.setItem('app_language', newLang);
        
        if (typeof window.onLanguageChange === 'function') {
            window.onLanguageChange(newLang);
        }
    });
    
    languageSelect.dataset.languageListenerAttached = 'true';
}

window.translate = translate;
window.t = translate;
window.applyTranslations = applyTranslations;
window.setupLanguageSwitcher = setupLanguageSwitcher;
window.onLanguageChange = null;

document.addEventListener('DOMContentLoaded', () => {
    const lang = getSavedLanguage();
    applyTranslations(lang);
    setupLanguageSwitcher();
});

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:5000',
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// Get the current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// API utility class
class ApiClient {
    constructor(baseUrl = API_CONFIG.BASE_URL) {
        this.baseUrl = baseUrl;
    }

    getHeaders() {
        const headers = { ...API_CONFIG.HEADERS };
        const user = getCurrentUser();
        
        // Add user headers if user is logged in
        if (user) {
            headers['user-id'] = user.id;
            headers['user-role'] = user.role;
        }
        
        return headers;
    }

    buildUrl(endpoint) {
        if (endpoint.startsWith('http')) {
            return endpoint;
        }
        return `${this.baseUrl}${endpoint}`;
    }

    async request(endpoint, options = {}) {
        const url = this.buildUrl(endpoint);
        const headers = this.getHeaders();
        
        const config = {
            method: options.method || 'GET',
            headers: { ...headers, ...options.headers },
            timeout: options.timeout || API_CONFIG.TIMEOUT
        };

        if (options.body) {
            config.body = typeof options.body === 'string' 
                ? options.body 
                : JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));

            return {
                status: response.status,
                ok: response.ok,
                data,
                error: !response.ok ? (data.error || response.statusText) : null
            };
        } catch (error) {
            return {
                status: 0,
                ok: false,
                data: null,
                error: error.message || 'Network error'
            };
        }
    }

    // Convenience methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    async put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

// Create default instance
const apiClient = new ApiClient();
