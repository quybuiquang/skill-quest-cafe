import { Link } from 'react-router-dom';
import { BookOpen, Github, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Interview Practice</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Nền tảng luyện tập phỏng vấn hàng đầu cho developer Việt Nam
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Tính năng</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Câu hỏi phỏng vấn</Link></li>
              <li><Link to="/add-question" className="hover:text-foreground transition-colors">Thêm câu hỏi</Link></li>
              <li><span>Lời giải từ cộng đồng</span></li>
              <li><span>Thảo luận & bình luận</span></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Danh mục</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Algorithm</li>
              <li>Backend</li>
              <li>Frontend</li>
              <li>Database</li>
              <li>System Design</li>
              <li>DevOps</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Liên hệ</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Interview Practice Café. Made with <Heart className="h-4 w-4 inline text-red-500" /> for Vietnamese developers.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-foreground transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-foreground transition-colors">Hỗ trợ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}