const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb'); // Adicionado ObjectId
const cors = require('cors');
const app = express();
const PORT = 3000;
const fs = require('fs');

const uri = "mongodb+srv://gremiogsd:@Gsd2025@gremio-estudantil-clust.zb17yok.mongodb.net/?retryWrites=true&w=majority&appName=gremio-estudantil-cluster"; // Sua string de conexão do MongoDB Atlas
const client = new MongoClient(uri);

let usersCollection;
let reunioesCollection;
let presencasCollection;
let relatoriosCollection;
let comissoesCollection;
let membrosComissaoCollection;
let tarefasCollection;
let arquivosCollection;
let eventosCollection;
let produtosCollection;
let vendasCollection;
let audiosCollection;
let comunicadosCollection;
let eventosRadioCollection;

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB Atlas!");

        const database = client.db("gremio_db"); // Nome do seu banco de dados no MongoDB Atlas
        usersCollection = database.collection("users");
        reunioesCollection = database.collection("reunioes");
        presencasCollection = database.collection("presencas");
        relatoriosCollection = database.collection("relatorios");
        comissoesCollection = database.collection("comissoes");
        membrosComissaoCollection = database.collection("membros_comissao");
        tarefasCollection = database.collection("tarefas");
        arquivosCollection = database.collection("arquivos");
        eventosCollection = database.collection("eventos");
        produtosCollection = database.collection("produtos");
        vendasCollection = database.collection("vendas");
        audiosCollection = database.collection("audios");
        comunicadosCollection = database.collection("comunicados");
        eventosRadioCollection = database.collection("eventos_radio");

        // Opcional: Inserir usuários de exemplo se a coleção estiver vazia
        const count = await usersCollection.countDocuments();
        if (count === 0) {
            const users = [
                { name: 'Gabriel Callegari', email: 'gabrielcallegari@gsd.com', role: 'presidente', sector: 'Diretoria Geral', password: 'senha123' },
                { name: 'Maxine', email: 'maxine@gsd.com', role: 'vice-presidente', sector: 'Diretoria Geral', password: 'senha123' },
                { name: 'Maria Eduarda', email: 'mariaeduarda@gsd.com', role: 'coordenador', sector: 'Finanças', password: 'senha123' },
                { name: 'Arthur', email: 'arthur@gsd.com', role: 'coordenador', sector: 'Finanças', password: 'senha123' },
                { name: 'Mavi', email: 'mavi@gsd.com', role: 'coordenador', sector: 'Eventos', password: 'senha123' },
                { name: 'Estephani', email: 'estephani@gsd.com', role: 'coordenador', sector: 'Eventos', password: 'senha123' },
                { name: 'Isaque', email: 'isaque@gsd.com', role: 'coordenador', sector: 'Esportes', password: 'senha123' },
                { name: 'Muralha', email: 'muralha@gsd.com', role: 'coordenador', sector: 'Esportes', password: 'senha123' },
                { name: 'Suyane', email: 'suyane@gsd.com', role: 'coordenador', sector: 'Relações Sociais', password: 'senha123' },
                { name: 'Heloisa', email: 'heloisa@gsd.com', role: 'coordenador', sector: 'Relações Sociais', password: 'senha123' },
                { name: 'Vitoria', email: 'vitoria@gsd.com', role: 'membro', sector: 'Rádio GSD Mix', password: 'senha123' },
                { name: 'Yan', email: 'yan@gsd.com', role: 'membro', sector: 'Rádio GSD Mix', password: 'senha123' },
                { name: 'Wesley', email: 'wesley@gsd.com', role: 'membro', sector: 'Rádio GSD Mix', password: 'senha123' },
                { name: 'Davi', email: 'davi@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: 'senha123' },
                { name: 'Lorrany', email: 'lorrany@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: 'senha123' },
                { name: 'Isabela', email: 'isabela@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: 'senha123' }
            ];
            await usersCollection.insertMany(users);
            console.log("Usuários de exemplo inseridos.");
        }

        // Relatórios de exemplo
        const relatoriosCount = await relatoriosCollection.countDocuments();
        if (relatoriosCount === 0) {
            const relatoriosExemplo = [
                {
                    tipo: "Criação de Projeto",
                    projeto: "Feira de Ciências",
                    coordenador: "João Silva",
                    status: "Pendente",
                    conteudo: "Descrição detalhada da Feira de Ciências.",
                    observacao: "",
                    usuario_email: "joao@gsd.com",
                    data_envio: new Date()
                },
                {
                    tipo: "Relatório de Andamento",
                    projeto: "Gincana Escolar",
                    coordenador: "Maria Eduarda",
                    status: "Aprovado",
                    conteudo: "A gincana está em andamento, tudo conforme o planejado.",
                    observacao: "",
                    usuario_email: "mariaeduarda@gsd.com",
                    data_envio: new Date()
                }
            ];
            await relatoriosCollection.insertMany(relatoriosExemplo);
            console.log("Relatórios de exemplo inseridos.");
        }

    } catch (e) {
        console.error("Erro ao conectar ao MongoDB Atlas:", e);
    }
}

connectToMongoDB();

app.use(cors()); // Para facilitar testes locais
app.use(express.json());

// Serve arquivos estáticos
app.use('/login', express.static(path.join(__dirname, 'public', 'login')));
app.use('/presidente', express.static(path.join(__dirname, 'public', 'presidente')));
app.use('/coordenador', express.static(path.join(__dirname, 'public', 'coordenador')));
app.use('/membro', express.static(path.join(__dirname, 'public', 'membro')));

// Redireciona para login
app.get('/', (req, res) => {
    res.redirect('/login/index_login.html');
});

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // pasta onde os arquivos ficarão

// Upload de arquivo
app.post('/api/arquivos', upload.single('arquivo'), async (req, res) => {
    try {
        const { originalname, filename, mimetype } = req.file;
        const { categoria } = req.body;
        const result = await arquivosCollection.insertOne({
            nome_original: originalname,
            nome_armazenado: filename,
            tipo: mimetype,
            categoria: categoria,
            data_upload: new Date()
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao salvar arquivo:', err);
        res.status(500).json({ error: 'Erro ao salvar arquivo.' });
    }
});

// Listar arquivos
app.get('/api/arquivos', async (req, res) => {
    try {
        const files = await arquivosCollection.find().sort({ data_upload: -1 }).toArray();
        res.json(files);
    } catch (err) {
        console.error('Erro ao buscar arquivos:', err);
        res.status(500).json({ error: 'Erro ao buscar arquivos.' });
    }
});

// Download de arquivo
app.get('/uploads/:nome', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.nome);
    res.sendFile(filePath);
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadAudios = multer({ dest: 'uploads/audios/' });

// Upload de áudio
app.post('/api/audios', uploadAudios.single('audio'), async (req, res) => {
    try {
        const { originalname, filename } = req.file;
        const { tipo, descricao } = req.body;
        const result = await audiosCollection.insertOne({
            nome_original: originalname,
            nome_armazenado: filename,
            tipo: tipo,
            descricao: descricao,
            data_upload: new Date()
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao salvar áudio:', err);
        res.status(500).json({ error: 'Erro ao salvar áudio.' });
    }
});

// Listar áudios
app.get('/api/audios', async (req, res) => {
    try {
        const audios = await audiosCollection.find().sort({ data_upload: -1 }).toArray();
        res.json(audios);
    } catch (err) {
        console.error('Erro ao buscar áudios:', err);
        res.status(500).json({ error: 'Erro ao buscar áudios.' });
    }
});

// Servir arquivos de áudio
app.use('/uploads/audios', express.static(path.join(__dirname, 'uploads', 'audios')));

// Criar comunicado
app.post('/api/comunicados', async (req, res) => {
    try {
        const { mensagem } = req.body;
        if (!mensagem) return res.status(400).json({ error: 'Mensagem obrigatória.' });
        const result = await comunicadosCollection.insertOne({
            mensagem: mensagem,
            data_envio: new Date()
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao salvar comunicado:', err);
        res.status(500).json({ error: 'Erro ao salvar comunicado.' });
    }
});

// Listar comunicados
app.get('/api/comunicados', async (req, res) => {
    try {
        const comunicados = await comunicadosCollection.find().sort({ data_envio: -1 }).toArray();
        res.json(comunicados);
    } catch (err) {
        console.error('Erro ao buscar comunicados:', err);
        res.status(500).json({ error: 'Erro ao buscar comunicados.' });
    }
});

// Rota para salvar uma reunião
app.post('/api/reunioes', async (req, res) => {
    try {
        const { nome, descricao, presencas } = req.body;

        console.log('Dados recebidos:', { nome, descricao, presencas });

        if (!nome || !descricao || !presencas) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const resultReuniao = await reunioesCollection.insertOne({
            nome: nome,
            descricao: descricao,
            data_criacao: new Date()
        });

        const reuniaoId = resultReuniao.insertedId;

        const presencasToInsert = presencas.map(p => ({
            reuniao_id: reuniaoId,
            usuario_id: new ObjectId(p.usuario_id), // Assumindo que usuario_id será um ObjectId
            status: p.status
        }));
        await presencasCollection.insertMany(presencasToInsert);

        res.status(201).json({ message: 'Reunião salva com sucesso!', id: reuniaoId });
    } catch (err) {
        console.error('Erro ao salvar reunião:', err);
        res.status(500).json({ error: 'Erro ao salvar a reunião.' });
    }
});

// Rota para listar todas as reuniões
app.get('/api/reunioes', async (req, res) => {
    try {
        const reunioes = await reunioesCollection.find().sort({ data_criacao: -1 }).toArray();
        for (let reuniao of reunioes) {
            reuniao.presencas = await presencasCollection.find({ reuniao_id: reuniao._id }).toArray();
            // Para cada presença, buscar o nome do usuário
            for (let presenca of reuniao.presencas) {
                const user = await usersCollection.findOne({ _id: presenca.usuario_id });
                if (user) {
                    presenca.usuario_nome = user.name;
                }
            }
        }
        res.json(reunioes);
    } catch (err) {
        console.error('Erro ao buscar reuniões:', err);
        res.status(500).json({ error: 'Erro ao buscar reuniões.' });
    }
});

// Rota para atualizar uma reunião
app.put('/api/reunioes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, presencas } = req.body;

        console.log('Atualizando reunião:', { id, nome, descricao, presencas });

        if (!nome || !descricao || !presencas) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        await reunioesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { nome: nome, descricao: descricao } }
        );

        await presencasCollection.deleteMany({ reuniao_id: new ObjectId(id) });

        const presencasToInsert = presencas.map(p => ({
            reuniao_id: new ObjectId(id),
            usuario_id: new ObjectId(p.usuario_id),
            status: p.status
        }));
        await presencasCollection.insertMany(presencasToInsert);

        res.status(200).json({ message: 'Reunião atualizada com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar reunião:', err);
        res.status(500).json({ error: 'Erro ao atualizar a reunião.' });
    }
});

// Rota para excluir uma reunião
app.delete('/api/reunioes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Excluindo reunião:', id);

        await presencasCollection.deleteMany({ reuniao_id: new ObjectId(id) });
        await reunioesCollection.deleteOne({ _id: new ObjectId(id) });

        res.status(200).json({ message: 'Reunião excluída com sucesso!' });
    } catch (err) {
        console.error('Erro ao deletar reunião:', err);
        res.status(500).json({ error: 'Erro ao excluir a reunião.' });
    }
});

// Rota para buscar uma reunião por ID
app.get('/api/reunioes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reuniao = await reunioesCollection.findOne({ _id: new ObjectId(id) });

        if (!reuniao) {
            return res.status(404).json({ error: 'Reunião não encontrada.' });
        }

        reuniao.presencas = await presencasCollection.find({ reuniao_id: reuniao._id }).toArray();
        for (let presenca of reuniao.presencas) {
            const user = await usersCollection.findOne({ _id: presenca.usuario_id });
            if (user) {
                presenca.usuario_nome = user.name;
            }
        }

        res.json(reuniao);
    } catch (err) {
        console.error('Erro ao buscar reunião:', err);
        res.status(500).json({ error: 'Erro ao buscar reunião.' });
    }
});

// Rota para listar usuários
app.get('/api/usuarios', async (req, res) => {
    try {
        const users = await usersCollection.find({}, { projection: { name: 1 } }).toArray(); // Retorna apenas id e name
        res.json(users);
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('E-mail recebido:', email);
        console.log('Senha recebida:', password);

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        const user = await usersCollection.findOne({ email: email });

        if (!user) {
            console.log('Usuário não encontrado.');
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        console.log('Usuário encontrado:', user);

        if (user.password !== password) {
            console.log('Senha incorreta.');
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        console.log('Login bem-sucedido.');
        res.status(200).json({ message: 'Login realizado com sucesso!', user });
    } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        res.status(500).json({ error: 'Erro ao buscar usuário.' });
    }
});

//end point relatorio
app.get('/api/relatorios', async (req, res) => {
    try {
        const relatorios = await relatoriosCollection.find().sort({ data_envio: -1 }).toArray();
        res.json(relatorios);
    } catch (err) {
        console.error('Erro ao buscar relatórios:', err);
        res.status(500).json({ error: 'Erro ao buscar relatórios.' });
    }
});

// Rota para atualizar status e observação do relatório
app.put('/api/relatorios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, observacao } = req.body;

        await relatoriosCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: status, observacao: observacao } }
        );
        res.json({ message: 'Relatório atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar relatório:', err);
        res.status(500).json({ error: 'Erro ao atualizar relatório.' });
    }
});

// Rota comissões
// Cadastrar uma nova comissão
app.post('/api/comissoes', async (req, res) => {
    try {
        const { nome, tipo, coordenador_id, coordenador_nome } = req.body;
        const result = await comissoesCollection.insertOne({
            nome: nome,
            tipo: tipo,
            coordenador_id: coordenador_id ? new ObjectId(coordenador_id) : null, // Converte para ObjectId se existir
            coordenador_nome: coordenador_nome,
            data_criacao: new Date()
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao cadastrar comissão:', err);
        res.status(500).json({ error: 'Erro ao cadastrar comissão.' });
    }
});

// Listar todas as comissões
app.get('/api/comissoes', async (req, res) => {
    try {
        const comissoes = await comissoesCollection.find().sort({ data_criacao: -1 }).toArray();
        res.json(comissoes);
    } catch (err) {
        console.error('Erro ao buscar comissões:', err);
        res.status(500).json({ error: 'Erro ao buscar comissões.' });
    }
});

// Adicionar membro à comissão
app.post('/api/membros_comissao', async (req, res) => {
    try {
        const { comissao_id, usuario_id, nome, email, funcao, senha } = req.body;

        let finalUsuarioId = usuario_id ? new ObjectId(usuario_id) : null;

        if (!usuario_id) {
            // Cria novo usuário fixo
            const newUserResult = await usersCollection.insertOne({
                name: nome,
                email: email,
                role: 'membro',
                sector: 'Comissão',
                password: senha
            });
            finalUsuarioId = newUserResult.insertedId;
        }

        const result = await membrosComissaoCollection.insertOne({
            comissao_id: new ObjectId(comissao_id),
            usuario_id: finalUsuarioId,
            nome: nome,
            email: email,
            funcao: funcao
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao adicionar membro:', err);
        res.status(500).json({ error: 'Erro ao adicionar membro.' });
    }
});

// Listar membros de uma comissão
app.get('/api/comissoes/:id/membros', async (req, res) => {
    try {
        const { id } = req.params;
        const membros = await membrosComissaoCollection.find({ comissao_id: new ObjectId(id) }).toArray();
        res.json(membros);
    } catch (err) {
        console.error('Erro ao buscar membros:', err);
        res.status(500).json({ error: 'Erro ao buscar membros.' });
    }
});

// Editar comissão
app.put('/api/comissoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, tipo, coordenador_id, coordenador_nome } = req.body;
        await comissoesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: {
                nome: nome,
                tipo: tipo,
                coordenador_id: coordenador_id ? new ObjectId(coordenador_id) : null,
                coordenador_nome: coordenador_nome
            } }
        );
        res.json({ message: 'Comissão atualizada com sucesso!' });
    } catch (err) {
        console.error('Erro ao editar comissão:', err);
        res.status(500).json({ error: 'Erro ao editar comissão.' });
    }
});

// Remover comissão
app.delete('/api/comissoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await comissoesCollection.deleteOne({ _id: new ObjectId(id) });
        await membrosComissaoCollection.deleteMany({ comissao_id: new ObjectId(id) });
        res.json({ message: 'Comissão removida com sucesso!' });
    } catch (err) {
        console.error('Erro ao remover comissão:', err);
        res.status(500).json({ error: 'Erro ao remover comissão.' });
    }
});

// Editar membro da comissão
app.put('/api/membros_comissao/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, funcao } = req.body;
        await membrosComissaoCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { nome: nome, email: email, funcao: funcao } }
        );
        res.json({ message: 'Membro atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao editar membro:', err);
        res.status(500).json({ error: 'Erro ao editar membro.' });
    }
});

// Remover membro da comissão
app.delete('/api/membros_comissao/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await membrosComissaoCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Membro removido com sucesso!' });
    } catch (err) {
        console.error('Erro ao remover membro:', err);
        res.status(500).json({ error: 'Erro ao remover membro.' });
    }
});

// Criar tarefa
app.post('/api/tarefas', async (req, res) => {
    try {
        const { titulo, descricao, data_limite, tipo_destinatario, destinatario_id } = req.body;
        const result = await tarefasCollection.insertOne({
            titulo: titulo,
            descricao: descricao,
            data_limite: data_limite,
            status: 'Pendente',
            tipo_destinatario: tipo_destinatario,
            destinatario_id: destinatario_id ? new ObjectId(destinatario_id) : null,
            data_criacao: new Date()
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao criar tarefa:', err);
        res.status(500).json({ error: 'Erro ao criar tarefa.' });
    }
});

// Listar tarefas
app.get('/api/tarefas', async (req, res) => {
    try {
        const tarefas = await tarefasCollection.find().sort({ data_criacao: -1 }).toArray();
        res.json(tarefas);
    } catch (err) {
        console.error('Erro ao buscar tarefas:', err);
        res.status(500).json({ error: 'Erro ao buscar tarefas.' });
    }
});

// Atualizar status ou editar tarefa
app.put('/api/tarefas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, data_limite, status } = req.body;

        const updateDoc = {};
        if (titulo !== undefined) updateDoc.titulo = titulo;
        if (descricao !== undefined) updateDoc.descricao = descricao;
        if (data_limite !== undefined) updateDoc.data_limite = data_limite;
        if (status !== undefined) updateDoc.status = status;

        if (Object.keys(updateDoc).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
        }

        await tarefasCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateDoc }
        );
        res.json({ message: 'Tarefa atualizada com sucesso!' });
    } catch (err) {
        console.error('Erro ao editar tarefa:', err);
        res.status(500).json({ error: 'Erro ao editar tarefa.' });
    }
});

// Remover tarefa
app.delete('/api/tarefas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await tarefasCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Tarefa removida com sucesso!' });
    } catch (err) {
        console.error('Erro ao remover tarefa:', err);
        res.status(500).json({ error: 'Erro ao remover tarefa.' });
    }
});

//rota para excluir arquivo 
app.delete('/api/arquivos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const file = await arquivosCollection.findOne({ _id: new ObjectId(id) });
        if (!file) return res.status(404).json({ error: 'Arquivo não encontrado.' });

        const filePath = path.join(__dirname, 'uploads', file.nome_armazenado);
        fs.unlink(filePath, async (err) => {
            if (err) {
                console.error('Erro ao excluir arquivo do sistema de arquivos:', err);
                return res.status(500).json({ error: 'Erro ao excluir arquivo do sistema de arquivos.' });
            }
            await arquivosCollection.deleteOne({ _id: new ObjectId(id) });
            res.json({ message: 'Arquivo excluído com sucesso!' });
        });
    } catch (err) {
        console.error('Erro ao excluir arquivo:', err);
        res.status(500).json({ error: 'Erro ao excluir arquivo.' });
    }
});

// Criar evento
app.post('/api/eventos', async (req, res) => {
    try {
        const { titulo, descricao, inicio, fim, tipo, criado_por } = req.body;
        const result = await eventosCollection.insertOne({
            titulo: titulo,
            descricao: descricao,
            inicio: inicio,
            fim: fim,
            tipo: tipo,
            criado_por: criado_por,
            data_criacao: new Date()
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao criar evento:', err);
        res.status(500).json({ error: 'Erro ao criar evento.' });
    }
});

// Listar eventos
app.get('/api/eventos', async (req, res) => {
    try {
        const eventos = await eventosCollection.find().sort({ inicio: 1 }).toArray();
        res.json(eventos);
    } catch (err) {
        console.error('Erro ao buscar eventos:', err);
        res.status(500).json({ error: 'Erro ao buscar eventos.' });
    }
});

// Editar evento
app.put('/api/eventos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, inicio, fim, tipo } = req.body;
        await eventosCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { titulo: titulo, descricao: descricao, inicio: inicio, fim: fim, tipo: tipo } }
        );
        res.json({ message: 'Evento atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao editar evento:', err);
        res.status(500).json({ error: 'Erro ao editar evento.' });
    }
});

// Remover evento
app.delete('/api/eventos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await eventosCollection.deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Evento removido com sucesso!' });
    } catch (err) {
        console.error('Erro ao remover evento:', err);
        res.status(500).json({ error: 'Erro ao remover evento.' });
    }
});

app.get('/api/ranking', async (req, res) => {
    try {
        const users = await usersCollection.find().toArray();
        const ranking = [];

        for (const user of users) {
            const presencasCount = await presencasCollection.countDocuments({ usuario_id: user._id });
            const tarefasConcluidasCount = await tarefasCollection.countDocuments({ destinatario_id: user._id, status: 'Concluída' });
            const pontos = presencasCount + tarefasConcluidasCount;
            ranking.push({
                id: user._id,
                name: user.name,
                presencas: presencasCount,
                tarefas_concluidas: tarefasConcluidasCount,
                pontos: pontos
            });
        }

        ranking.sort((a, b) => b.pontos - a.pontos || a.name.localeCompare(b.name));
        res.json(ranking);
    } catch (err) {
        console.error('Erro ao buscar ranking:', err);
        res.status(500).json({ error: 'Erro ao buscar ranking.' });
    }
});

// Criar relatório
app.post('/api/relatorios', async (req, res) => {
    try {
        const { tipo, projeto, coordenador, conteudo, observacao, usuario_email } = req.body;
        const result = await relatoriosCollection.insertOne({
            tipo: tipo,
            projeto: projeto,
            coordenador: coordenador,
            status: 'Pendente',
            conteudo: conteudo,
            observacao: observacao,
            usuario_email: usuario_email,
            data_envio: new Date()
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao criar relatório:', err);
        res.status(500).json({ error: 'Erro ao criar relatório.' });
    }
});

// Rota para listar produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await produtosCollection.find().sort({ _id: 1 }).toArray();
        res.json(produtos);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
});

// Rota para cadastrar produtos
app.post('/api/produtos', async (req, res) => {
    try {
        const { nome, preco, quantidade } = req.body;
        const result = await produtosCollection.insertOne({
            nome: nome,
            preco: preco,
            quantidade: quantidade
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao salvar produto:', err);
        res.status(500).json({ error: 'Erro ao salvar produto.' });
    }
});

// Rota para registrar vendas
app.post('/api/vendas', async (req, res) => {
    try {
        const { produtos, total, valorRecebido, troco } = req.body;
        const result = await vendasCollection.insertOne({
            produtos: produtos,
            total: total,
            valorRecebido: valorRecebido,
            troco: troco,
            data_venda: new Date()
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao salvar venda:', err);
        res.status(500).json({ error: 'Erro ao salvar venda.' });
    }
});

// Criar evento da rádio
app.post('/api/eventos_radio', async (req, res) => {
    try {
        const { titulo, inicio, fim, descricao } = req.body;
        const result = await eventosRadioCollection.insertOne({
            titulo: titulo,
            inicio: inicio,
            fim: fim,
            descricao: descricao
        });
        res.json({ id: result.insertedId });
    } catch (err) {
        console.error('Erro ao salvar evento da rádio:', err);
        res.status(500).json({ error: 'Erro ao salvar evento da rádio.' });
    }
});

// Listar eventos da rádio
app.get('/api/eventos_radio', async (req, res) => {
    try {
        const eventos = await eventosRadioCollection.find().toArray();
        res.json(eventos);
    } catch (err) {
        console.error('Erro ao buscar eventos da rádio:', err);
        res.status(500).json({ error: 'Erro ao buscar eventos da rádio.' });
    }
});

// Inicializar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
