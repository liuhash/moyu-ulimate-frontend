package com.lby.moyuultimate;

// 导入Spring Boot核心类，用于启动Spring应用
import org.springframework.boot.SpringApplication;
// 导入Spring Boot自动配置注解，启用自动配置功能
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 标记这是一个Spring Boot应用的主类，并启用自动配置和组件扫描
@SpringBootApplication
public class MoyuUltimateApplication {

	// 主方法，应用程序入口点
	public static void main(String[] args) {
		// 启动Spring Boot应用，传入主类和命令行参数
		SpringApplication.run(MoyuUltimateApplication.class, args);
	}

}
