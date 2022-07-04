const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const models = require('./models');

//업로드 이미지를 관리하는 스토리지 서버를 연결 -> 멀터를 사용하겠다.
const multer = require("multer");

//이미지 파일 요청이 오면 어디에 저장할건지 지정
const upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb){
            //어디에 저장할건지? upload/
            cb(null, 'upload/')
        },
        filename : function(req, file, cb){
            //어떤 이름으로 지정할건지?
            //file객체의 오리지널 이름으로 저장하겠다
            cb(null, file.originalname)
        }
    })
});

//json 방식의 데이터를 처리할 수 있게 설정
app.use(express.json());

//브라우저 cors 이슈를 막기 위해 사용 (모든 브라우저의 요청을 일정하게 받겠다)
app.use(cors());

//업로드 폴더에 있는 파일에 접근할 수 있도록 설정
app.use("/upload", express.static("upload"));


//요청처리
//app.메서드(url, 함수)
//이미지 파일이 post로 요청이 왔을 때 upload라는 폴더에 이미지를 저장하기
//이미지가 하나일 때 single
app.post('/image', upload.single('image'), (req, res)=>{
    const file = req.file;
    console.log(file);
    res.send({
        imageUrl : "http://localhost:3000/"+file.destination+file.filename
    })
});


app.get('/products', async (req, res)=>{
    //데이터베이스 조회하기
    models.Product.findAll()
    .then(result=>{
        console.log("제품 전체조회", result);
        res.send(result);
        // res.send({
        //     product : result
        // });
    })
    .catch(e=>{
        console.error(e);
        res.send("파일 조회에 문제가 있습니다.")
    })
});

//method get요청이 오고 url은 /product/2 로 요청이 왔을 때
app.get('/product/:id', async (req, res)=>{
    const params = req.params;
    // const { id } = params;
    //하나만 조회할 때는 findOne -> select문
    models.Product.findOne({
        //조건절
        where : {
            id : params.id
        }
    })
    .then(result=>{
        res.send(result);
    })
    .catch(e=>{
        console.log(e);
        res.send('상품 조회에 문제가 생겼습니다.')
    })
});
app.post('/green', async (req, res)=>{
    console.log(req);
    res.send('게시글이 등록되었씁니다.')
})

app.post("/products", (req, res)=>{
    //http body에 있는 데이터
    const body = req.body;
    //body 객체에 있는 값을 구조분해 할당 
    const { name, price, seller, imageUrl, description} = body;
    if(!name || !price || !seller){
        res.send("모든 항목을 입력해주세요.");
    }
    //Product테이블에 레코드를 삽입
    models.Product.create({
        name,
        price,
        seller,
        imageUrl,
        description,
    }).then(result=>{
        console.log('상품 생성 결과 : ', result);
        res.send({
            result
        });
    })
    .catch(e=>{
        console.log(error);
        res.send("상품 업로드에 문제가 생겼습니다.");
    })
})

//delete삭제하기
app.delete('/product/:id', async (req, res) => {
    const params = req.params;
    models.Product.destroy({ where: { id: params.id }})
    .then(res.send("상품이 삭제되었습니다"));
})

//실행
app.listen(port, ()=>{
    console.log('쇼핑몰 서버가 동작중입니다.');

    //sequelize와 데이터베이스 연결 작업
    //데이터베이스 동기화
    models.sequelize
    .sync()
    .then(()=>{
        console.log('DB연결 성공');
    })
    .catch(e=>{
        console.error(e);
        console.log('DB연결 에러');
        //서버 실행이 안되면 프로세서 종료
        process.exit();
    })
})