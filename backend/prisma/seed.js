const { PrismaClient } = require('../generated/prisma');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
    console.log("Seed iniciado...");

    // 1. Crear clínicas (mínimo 5)
    const clinics = [];
    for (let i = 0; i < 5; i++) {
        const clinic = await prisma.clinic.create({
            data: {
                name: faker.company.name(),
                address: faker.location.streetAddress(),
                phone: faker.phone.number(),
                is_human_clinic: faker.datatype.boolean(),
            },
        });
        clinics.push(clinic);
    }

    // 2. Crear usuarios (mínimo 5)
    const users = [];
    for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                password_hash: faker.internet.password(),
                full_name: faker.person.fullName(),
            },
        });
        users.push(user);
    }

    // 3. Asignar roles a usuarios en clínicas (mínimo 5 UserClinicRole)
    const userClinicRoles = [];
    for (let i = 0; i < 5; i++) {
        const user = users[i % users.length];
        const clinic = clinics[i % clinics.length];

        const role = await prisma.userClinicRole.create({
            data: {
                user_id: user.id,
                clinic_id: clinic.id,
                role: faker.helpers.arrayElement(['owner', 'admin', 'user']),
            },
        });
        userClinicRoles.push(role);
    }

    // 4. Crear clientes (mínimo 5)
    const clients = [];
    for (let i = 0; i < 8; i++) {
        const clinic = clinics[i % clinics.length];

        const client = await prisma.client.create({
            data: {
                clinic_id: clinic.id,
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                dni: faker.string.numeric(8),
                address: faker.location.streetAddress(),
                notes: faker.lorem.sentence(),
            },
        });
        clients.push(client);
    }

    // 5. Crear pacientes (mínimo 5)
    const patients = [];
    for (let i = 0; i < 8; i++) {
        const clinic = clinics[i % clinics.length];
        const isHuman = clinic.is_human_clinic;

        const patient = await prisma.patient.create({
            data: {
                external_id: isHuman
                    ? `H-${faker.number.int({ min: 1000, max: 9999 })}`
                    : `A-${faker.number.int({ min: 1000, max: 9999 })}`,
                type_code: isHuman ? 'H' : 'A',
                name: isHuman ? faker.person.fullName() : faker.animal.dog(),
                species: isHuman ? 'Humano' : 'Animal',
                breed: isHuman ? null : faker.animal.dog(),
                birth_date: faker.date.birthdate({ min: 0, max: 90, mode: 'age' }),
                gender: faker.person.sex(),
                dni: isHuman ? faker.string.numeric(8) : null,
                email: isHuman ? faker.internet.email() : null, // Solo humanos tienen email
                phone: isHuman ? faker.phone.number() : null, // Solo humanos tienen teléfono
                address: isHuman ? faker.location.streetAddress() : null, // Solo humanos tienen dirección
                is_alive: true,
                primary_doctor_id: users[i % users.length].id,
                notes: faker.lorem.sentence(),
                clinic_id: clinic.id,
                client_id: isHuman ? null : clients[i % clients.length].id, // Solo mascotas tienen cliente
            },
        });
        patients.push(patient);
    }

    // 6. Crear permisos de pacientes (mínimo 5 PatientPermission)
    const patientPermissions = [];
    for (let i = 0; i < 8; i++) {
        const patient = patients[i % patients.length];
        const user = users[i % users.length];

        const permission = await prisma.patientPermission.create({
            data: {
                patient_id: patient.id,
                user_id: user.id,
                can_view: true,
                can_add: faker.datatype.boolean(),
                can_edit_own: faker.datatype.boolean(),
                can_edit_all: faker.datatype.boolean(),
                expires_at: faker.date.future(),
            },
        });
        patientPermissions.push(permission);
    }

    // 7. Crear registros médicos (mínimo 5 MedicalRecord)
    const medicalRecords = [];
    for (let i = 0; i < 8; i++) {
        const patient = patients[i % patients.length];
        const doctor = users[i % users.length];

        const record = await prisma.medicalRecord.create({
            data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                date: faker.date.past(),
                summary: faker.lorem.sentence(),
                type: faker.helpers.arrayElement(['consulta', 'cirugía', 'vacunación', 'control']),
                notes: faker.lorem.paragraph(),
                status: 'active',
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
        medicalRecords.push(record);
    }

    // 8. Crear archivos de registros (mínimo 5 RecordFile)
    const recordFiles = [];
    for (let i = 0; i < 8; i++) {
        const record = medicalRecords[i % medicalRecords.length];

        const file = await prisma.recordFile.create({
            data: {
                record_id: record.id,
                file_url: faker.internet.url(),
                type: faker.helpers.arrayElement(['imagen', 'documento', 'radiografía', 'laboratorio']),
                uploaded_at: new Date(),
            },
        });
        recordFiles.push(file);
    }

    // 9. Crear logs de auditoría (mínimo 5 RecordAuditLog)
    const recordAuditLogs = [];
    for (let i = 0; i < 8; i++) {
        const record = medicalRecords[i % medicalRecords.length];
        const user = users[i % users.length];

        const log = await prisma.recordAuditLog.create({
            data: {
                record_id: record.id,
                user_id: user.id,
                action: faker.helpers.arrayElement(['create', 'update', 'delete', 'view']),
                timestamp: new Date(),
                detail: faker.lorem.sentence(),
            },
        });
        recordAuditLogs.push(log);
    }

    // 10. Crear citas (mínimo 5 Appointment)
    const appointments = [];
    for (let i = 0; i < 8; i++) {
        const patient = patients[i % patients.length];
        const doctor = users[i % users.length];
        const clinic = clinics[i % clinics.length];

        const appointment = await prisma.appointment.create({
            data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                clinic_id: clinic.id,
                date: faker.date.soon(),
                time: faker.date.soon(),
                status: faker.helpers.arrayElement(['pendiente', 'confirmada', 'cancelada', 'completada']),
                notes: faker.lorem.sentence(),
                send_whatsapp_reminder: faker.datatype.boolean(),
            },
        });
        appointments.push(appointment);
    }

    // 11. Crear vacunas (mínimo 5 Vaccine)
    const vaccines = [];
    for (let i = 0; i < 8; i++) {
        const patient = patients[i % patients.length];
        const doctor = users[i % users.length];

        const vaccine = await prisma.vaccine.create({
            data: {
                patient_id: patient.id,
                name: faker.helpers.arrayElement(['Triple Viral', 'Antirrábica', 'Pentavalente', 'COVID-19', 'Influenza']),
                dose: faker.number.int({ min: 1, max: 3 }).toString(),
                date: faker.date.past(),
                next_dose_date: faker.date.future(),
                doctor_id: doctor.id,
                notes: faker.lorem.sentence(),
            },
        });
        vaccines.push(vaccine);
    }

    // 12. Crear medicamentos (mínimo 5 Medication)
    const medications = [];
    for (let i = 0; i < 8; i++) {
        const patient = patients[i % patients.length];

        const medication = await prisma.medication.create({
            data: {
                patient_id: patient.id,
                medication_name: faker.helpers.arrayElement(['Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Omeprazol', 'Loratadina']),
                dose: faker.number.int({ min: 1, max: 3 }).toString() + ' mg',
                start_date: faker.date.past(),
                end_date: faker.date.future(),
                instructions: faker.lorem.sentence(),
            },
        });
        medications.push(medication);
    }

    // 13. Crear notificaciones (mínimo 5 Notification)
    const notifications = [];
    for (let i = 0; i < 8; i++) {
        const user = users[i % users.length];

        const notification = await prisma.notification.create({
            data: {
                user_id: user.id,
                type: faker.helpers.arrayElement(['email', 'sms', 'push', 'whatsapp']),
                content: faker.lorem.sentence(),
                scheduled_at: faker.date.soon(),
                status: faker.helpers.arrayElement(['pending', 'sent', 'failed']),
            },
        });
        notifications.push(notification);
    }

    // 14. Crear productos (mínimo 5 Product)
    const products = [];
    for (let i = 0; i < 8; i++) {
        const clinic = clinics[i % clinics.length];

        const product = await prisma.product.create({
            data: {
                clinic_id: clinic.id,
                name: faker.commerce.productName(),
                sku: faker.string.uuid(),
                description: faker.commerce.productDescription(),
            },
        });
        products.push(product);
    }

    // 15. Crear inventario (mínimo 5 Inventory)
    const inventories = [];
    for (let i = 0; i < 8; i++) {
        const product = products[i % products.length];

        const inventory = await prisma.inventory.create({
            data: {
                product_id: product.id,
                quantity: faker.number.int({ min: 10, max: 100 }),
                expiration_date: faker.date.future(),
                location: faker.helpers.arrayElement(['Almacén A', 'Almacén B', 'Refrigerador', 'Estante 1', 'Estante 2']),
            },
        });
        inventories.push(inventory);
    }

    // 16. Crear transacciones financieras (mínimo 5 FinancialTransaction)
    const financialTransactions = [];
    for (let i = 0; i < 8; i++) {
        const clinic = clinics[i % clinics.length];

        const transaction = await prisma.financialTransaction.create({
            data: {
                clinic_id: clinic.id,
                type: faker.helpers.arrayElement(['income', 'expense']),
                amount: parseFloat(faker.commerce.price(100, 1000, 2)),
                date: faker.date.recent(),
                description: faker.lorem.sentence(),
            },
        });
        financialTransactions.push(transaction);
    }

    // 17. Crear items de transacción (mínimo 5 TransactionItem)
    const transactionItems = [];
    for (let i = 0; i < 8; i++) {
        const transaction = financialTransactions[i % financialTransactions.length];
        const product = products[i % products.length];

        const item = await prisma.transactionItem.create({
            data: {
                transaction_id: transaction.id,
                product_id: product.id,
                quantity: faker.number.int({ min: 1, max: 5 }),
                unit_price: parseFloat(faker.commerce.price(10, 100, 2)),
            },
        });
        transactionItems.push(item);
    }

    // 18. Crear suscripciones (mínimo 5 Subscription)
    const subscriptions = [];
    for (let i = 0; i < 5; i++) {
        const clinic = clinics[i % clinics.length];

        const subscription = await prisma.subscription.create({
            data: {
                clinic_id: clinic.id,
                plan_name: faker.helpers.arrayElement(['Basic', 'Standard', 'Premium', 'Enterprise']),
                payment_status: faker.helpers.arrayElement(['paid', 'pending', 'overdue', 'cancelled']),
                renewal_date: faker.date.future(),
                user_limit: faker.number.int({ min: 5, max: 50 }),
            },
        });
        subscriptions.push(subscription);
    }

    // 19. Crear configuración de clínica (mínimo 5 ClinicSettings)
    const clinicSettings = [];
    for (let i = 0; i < 5; i++) {
        const clinic = clinics[i % clinics.length];

        const setting = await prisma.clinicSettings.create({
            data: {
                clinic_id: clinic.id,
                file_storage_type: faker.helpers.arrayElement(['local', 'google_drive', 'aws_s3', 'azure']),
                local_storage_path: '/storage/' + faker.word.noun(),
                google_drive_folder_id: faker.string.uuid(),
                google_api_token: faker.string.uuid(),
            },
        });
        clinicSettings.push(setting);
    }

    console.log("Seed finalizado. Se crearon:");
    console.log(`- ${clinics.length} clínicas`);
    console.log(`- ${users.length} usuarios`);
    console.log(`- ${userClinicRoles.length} roles de usuario en clínicas`);
    console.log(`- ${clients.length} clientes`);
    console.log(`- ${patients.length} pacientes`);
    console.log(`- ${patientPermissions.length} permisos de pacientes`);
    console.log(`- ${medicalRecords.length} registros médicos`);
    console.log(`- ${recordFiles.length} archivos de registros`);
    console.log(`- ${recordAuditLogs.length} logs de auditoría`);
    console.log(`- ${appointments.length} citas`);
    console.log(`- ${vaccines.length} vacunas`);
    console.log(`- ${medications.length} medicamentos`);
    console.log(`- ${notifications.length} notificaciones`);
    console.log(`- ${products.length} productos`);
    console.log(`- ${inventories.length} inventarios`);
    console.log(`- ${financialTransactions.length} transacciones financieras`);
    console.log(`- ${transactionItems.length} items de transacción`);
    console.log(`- ${subscriptions.length} suscripciones`);
    console.log(`- ${clinicSettings.length} configuraciones de clínica`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
